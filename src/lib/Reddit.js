const Snoowrap = require('../config/snoo.config');
const MentionBot = require('../service/MentionBot');
const SubMonitorBot = require('../service/SubMonitorBot');
const CommandBot = require('../service/CommandBot');
const WikiEditorBot = require('../service/WikiEditorBot');
const PriorityQueue = require('../util/PriorityQueue');
/*
    [Reddit Wrapper]

        - Accepts a preconfigured snoowrap client
            - If no client is passed to the constructor, it will use the default one.

        - Class contains functions to interact with these services:
            a. MentionBot
                - Listens for username mentions in the inbox
            b. SubMonitor
                - Watches a subreddits *new* section for new submissions
            c. ThreadFollower
                - Follows a single thread to listen for commands
            d. WikiEditor
                - Edits Wiki Pages

            - Also Exports the raw Snoowrap requester.
            
*/
module.exports = class Reddit {
    constructor() {
        /* Snoowrap API */
        this.requester = this.requester = new Snoowrap().getRequester();
        /* Wrappers */
        this.mentions = new MentionBot(this.requester, process.env.LIMIT);
        this.submissions = new SubMonitorBot(this.requester, process.env.MASTER_SUB, process.env.LIMIT);
        this.commands = new CommandBot(this.requester, process.env.THREAD_ID, process.env.LIMIT);
        this.wikieditor = new WikiEditorBot(this.requester, process.env.MASTER_SUB, process.env.LIMIT);


        /* Check for first run of get functions */
        this.mentionsAssigned = false;
        this.submissionsAssigned = false;
        this.commandsAssigned = false;

        /* All Tasks */
        this.tasks = new PriorityQueue();
    }

    /*
        [Get Mentions]
            - Asks MentionBot Service to get mentions
            - The first time calling getMentions, will run assignFirst
            - Returns the mention queue
    */
    async getMentions(priority) {
        let mentions;
        if (!this.mentionsAssigned) {
            mentions = await this.mentions.assignFirst();
            this.mentionsAssigned = true;
        } else {
            mentions = await this.mentions.checkAgain();
        }
        // Dequeue all the mentions into the priority queue
        while (mentions && !mentions.isEmpty()) {
            console.log("command queue size: ", mentions.size());
            this.tasks.enqueue([mentions.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get Submissions]
            - Asks SubMonitor Service to get submissions
            - The first time calling getSubmissions, will run assignFirst
            - Returns the submission queue
    */
    async getSubmissions(priority) {
        let submissions;
        if (!this.submissionsAssigned) {
            submissions = await this.submissions.assignFirst();
            this.submissionsAssigned = true;
        } else {
            submissions = await this.submissions.checkAgain();
        }
        // Dequeue all the submissions into the priority queue
        while (submissions && !submissions.isEmpty()) {
            console.log("command queue size: ", submissions.size());
            this.tasks.enqueue([submissions.dequeue(), priority]);
        }
        return this.tasks;
    }
    /*
        [Get Commands]
            - Asks ThreadFollower Service to get commands
            - The first time calling getCommands, will run assignFirst
            - Returns the command queue
    */
    async getCommands(priority) {
        console.log("RedditLib getting Commands with priority: ", priority);
        let commands;
        if (!this.commandsAssigned) {
            commands = await this.commands.assignFirst();
            this.commandsAssigned = true;
        } else {
            commands = await this.commands.checkAgain();
        }
        // console.log(`commands size before dequeueing: ${commands.size()}`);
        // Dequeue all the submissions into the priority queue
        while (commands && !commands.isEmpty()) {
            console.log("command queue size: ", commands.size());
            this.tasks.enqueue([commands.dequeue(), priority]);
        }
        return this.tasks;
    }
    getWikiEditor() {
        return this.wikieditor;
    }
    getRequester() {
        return this.requester;
    }

}