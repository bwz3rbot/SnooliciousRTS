const Snoowrap = require('../config/snoo.config');
const MentionBot = require('../service/MentionBot');
const SubMonitorBot = require('../service/SubMonitorBot');
const MultiSubMonitorBot = require('../service/MultiSubMonitorBot');
const CommandBot = require('../service/CommandBot');
const WikiEditor = require('../service/WikiEditor');
const NannyBot = require('../service/NannyBot');
const PriorityQueue = require('../util/PriorityQueue');
const Command = require('../util/Command');
/*
    [Snoolicious RTS] - Snoolicious Reddit Tool Suite
    
    Instantiates a Snoowrap requester, then genrates helper classes to manage commands.

        - Class contains functions to interact with these services:
            a. MentionBot
                - Listens for username mentions in the inbox
            b. SubMonitorBot
                - Watches a subreddits *new* section for new submissions
            c. CommandBot
                - Follows a single thread to listen for commands
            d. WikiEditor
                - Edits Wiki Pages
                - Has access to SnooMD

        The tasks list is a PriorityQueue that will get the queued messages from the mentions, submissions, and commands queues,
        and dequeue them from their original queue, then re-enqueue them into itself. The priority level is to be defined when
        calling the get* functions. With 0 being highest priority, all tasks will be called first in first out from the tasks queue.
            
*/
module.exports = class Reddit {
    constructor() {
        /* [Snoowrap API] */
        this.requester = new Snoowrap().requester;

        /* [Command Parser] */
        this.COMMANDS = Command;

        /* [Services] */

        /* [MentionBot Service] */
        this.mentions = new MentionBot(this.requester);
        /* [SubMonitorBot Service] */
        this.submissions = new SubMonitorBot(this.requester);
        /* [MultiSubMonitor Service] */
        this.multis = new MultiSubMonitorBot(this.requester);
        /* [CommandBot Service] */
        this.commands = new CommandBot(this.requester, process.env.THREAD_ID);
        /* [WikiEditor Service] */
        this.wikieditor = new WikiEditor(this.requester);
        /* [UserFollower Service] */
        this.nannybot = new NannyBot(this.requester);

        /* [Multi-Thread Command Service] */
        this.multithreads = new Map();

        /* 
            [Tasks]
                - Tasks = All tasks to be fulfilled by the bot
                - All items are dequeued from their original bot service queues and into this priority queue
         */
        this.tasks = new PriorityQueue();
    }
    /*
        [Add Thread]
            - Adds a new Command Bot with thread id to Snoolicious
            - Returns the Command Bot
    */
    addThread(priority, threadId) {
        const CmdBot = new CommandBot(this.requester, threadId);
        this.multithreads.set(priority, CmdBot);
        return CmdBot;
    }
    /*
        [Remove Thread]
            - Deletes the specified Command Bot from Snoolicious
    */
    removeThread(priority) {
        return this.multithreads.delete(priority);

    }
    /*
          [Get Multi-Thread Commands]
              - Gets the command thread by prio level
              - Dequeues the tasks into the Snoolicious task queue
              - Returns the task queue.
      */
    async getMultithreadCommands(priority) {
        const commands = await this.multithreads.get(priority).getCommands();
        while (commands && !commands.isEmpty()) {
            this.tasks.enqueue([commands.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get Mentions]
            - Asks MentionBot Service to get mentions
            - The first time calling getMentions, will run assignFirst
            - Dequeues the mention queue into tasks queue
            - Returns the tasks queue
    */
    async getMentions(priority) {
        const mentions = await this.mentions.getMentions();
        // Dequeue all the mentions into the priority queue
        while (mentions && !mentions.isEmpty()) {
            this.tasks.enqueue([mentions.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get Submissions]
            - Asks SubMonitor Service to get submissions
            - Dequeues the submissions queue into tasks queue
            - Returns the tasks queue
    */
    async getSubmissions(priority) {
        const submissions = await this.submissions.getSubmissions();
        // Dequeue all the submissions into the priority queue
        while (submissions && !submissions.isEmpty()) {
            this.tasks.enqueue([submissions.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get Multis]
            - Asks MultiSubMonitor Service to get submissions from all defined subreddits
            - Dequeues the submissions queue into tasks queue
            - Returns the tasks queue
    */
    async getMultis(priority) {
        const multis = await this.multis.getSubmissions();
        // Dequeue all the submissions into the priority queue
        while (multis && !multis.isEmpty()) {
            this.tasks.enqueue([multis.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get Commands]
            - Asks ThreadFollower Service to get commands
            - Dequeues the command queue into tasks queue
            - Returns the tasks queue
    */
    async getCommands(priority) {
        const commands = await this.commands.getCommands();
        // Dequeue all the commands into the priority queue
        while (commands && !commands.isEmpty()) {
            this.tasks.enqueue([commands.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get User]
            - Asks UserFollower Service to get a users latest posts
            - Dequeues the command queue into tasks queue
            - Returns the tasks queue
    */
    async nannyUser(user, priority) {
        const posts = await this.nannybot.getUserPosts(user);
        // Dequeue all the commands into the priority queue
        while (posts && !posts.isEmpty()) {
            this.tasks.enqueue([posts.dequeue(), priority]);
        }
        return this.tasks;
    }
    /* 
        [Query Tasks]
            - Dequeus all the tasks and handles commands based on your callback function
            - Checks if item.body exists before handling command
            - If item.body exists, runs handleSubmission instead.
     */
    async queryTasks(handleCommand, handleSubmission) {
        console.log("Querying new tasks!".green);
        const D = new Date().getTime();
        while (!this.tasks.isEmpty()) {
            const task = this.tasks.dequeue();
            // If not a submission
            if (task.item.body) {
                console.log('task.item.body:', task.item.body);
                let command;
                console.log('was it a username mention?');

                task.item.type === 'username_mention' ?
                    command = this.COMMANDS.stripULINK(task.item.body) :
                    command = task.item.body;

                console.log('handling command...');

                command = this.COMMANDS.handle(command);
                if (command) { // If the item received was a command, return the command, the item, and priority
                    const T = {
                        command: command,
                        item: task.item,
                        priority: task.priority,
                        time: D
                    }
                    await handleCommand(T);
                }
            } else if (task.item.title) { // Task was a submission
                const T = {
                    item: task.item,
                    priority: task.priority,
                    time: D
                }
                await handleSubmission(T);
            }
        }
    }
    /* [Wiki Editor] */
    getWikiEditor() {
        return this.wikieditor;
    }
    /* [Snoowrap Requester] */
    getRequester() {
        return this.requester;
    }
}