const Snoowrap = require('../config/snoo.config');
const MentionBot = require('../service/MentionBot');
const SubMonitorBot = require('../service/SubMonitorBot');
const CommandBot = require('../service/CommandBot');
const WikiEditor = require('../service/WikiEditor');
const PriorityQueue = require('../util/PriorityQueue');
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
        this.requester = this.requester = new Snoowrap().getRequester();

        /* [Services] */

        /* [MentionBot Service] */
        this.mentions = new MentionBot(this.requester, process.env.STARTUP_LIMIT, process.env.MENTIONS_LIMIT);
        /* [SubMonitorBot Service] */
        this.submissions = new SubMonitorBot(this.requester, process.env.MASTER_SUB, process.env.STARTUP_LIMIT, process.env.SUBMISSION_LIMIT);
        /* [CommandBot Service] */
        this.commands = new CommandBot(this.requester, process.env.THREAD_ID, process.env.STARTUP_LIMIT);
        /* [WikiEditor Service] */
        this.wikieditor = new WikiEditor(this.requester, process.env.MASTER_SUB);

        /* [Check for first run of get functions] */
        this.mentionsAssigned = false;
        this.submissionsAssigned = false;
        this.commandsAssigned = false;

        /* 
            [Tasks]
                - Tasks = All tasks to be fulfilled by the bot
                - All items are dequeued from their original bot service queues and into this priority queue
         */
        this.tasks = new PriorityQueue();
    }
    /*
        [Get Mentions]
            - Asks MentionBot Service to get mentions
            - The first time calling getMentions, will run assignFirst
            - Dequeues the mention queue into tasks queue
            - Returns the tasks queue
    */
    async getMentions(priority) {
        let mentions; // First pass check
        if (!this.mentionsAssigned) {
            mentions = await this.mentions.assignFirst();
            this.mentionsAssigned = true;
        } else {
            mentions = await this.mentions.checkAgain();
        }
        // Dequeue all the mentions into the priority queue
        while (mentions && !mentions.isEmpty()) {

            this.tasks.enqueue([mentions.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get Submissions]
            - Asks SubMonitor Service to get submissions
            - The first time calling getSubmissions, will run assignFirst
            - Dequeues the submissions queue into tasks queue
            - Returns the tasks queue
    */
    async getSubmissions(priority) {
        let submissions; // First pass check
        if (!this.submissionsAssigned) {
            submissions = await this.submissions.assignFirst();
            this.submissionsAssigned = true;
        } else {
            submissions = await this.submissions.checkAgain();
        }
        // Dequeue all the submissions into the priority queue
        while (submissions && !submissions.isEmpty()) {
            this.tasks.enqueue([submissions.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get Commands]
            - Asks ThreadFollower Service to get commands
            - The first time calling getCommands, will run assignFirst
            - Dequeues the command queue into tasks queue
            - Returns the tasks queue
    */
    async getCommands(priority) {
        let commands; // First pass check
        if (!this.commandsAssigned) {
            commands = await this.commands.assignFirst();
            this.commandsAssigned = true;
        } else {
            commands = await this.commands.checkAgain();
        }
        // Dequeue all the commands into the priority queue
        while (commands && !commands.isEmpty()) {
            this.tasks.enqueue([commands.dequeue(), priority]);
        }
        return this.tasks;
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