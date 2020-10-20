let Snoowrap = require('../config/snoo.config');
const MentionBot = require('../service/MentionBot');
const SubMonitorBot = require('../service/SubMonitorBot');
const ThreadFollowerBot = require('../service/ThreadFollowerBot');
const WikiEditorBot = require('../service/WikiEditorBot');
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
    constructor(S) {
        /* Snoowrap API */

        S ? this.requester = S : this.requester = new Snoowrap().getRequester();
        /* Wrappers */
        this.mentions = new MentionBot(this.requester, process.env.LIMIT);
        this.submissions = new SubMonitorBot(this.requester, process.env.MASTER_SUB, process.env.LIMIT);
        this.commands = new ThreadFollowerBot(this.requester, process.env.THREAD_ID, process.env.LIMIT);
        this.wikieditor = new WikiEditorBot(this.requester, process.env.MASTER_SUB, process.env.LIMIT);


        /* Check for first run of get functions */
        this.mentionsAssigned = false;
        this.submissionsAssigned = false;
        this.commandsAssigned = false;
    }

    /*
        [Get Mentions]
            - Asks MentionBot Service to get mentions
            - The first time calling getMentions, will run assignFirst
            - Returns the mention queue
    */
    async getMentions() {
        let mentions;
        if (!this.mentionsAssigned) {
            mentions = await this.mentions.assignFirst();
            this.mentionsAssigned = true;
        } else {
            mentions = await this.mentions.checkAgain();
        }
        return this.mentions.mentions;
    }
    /*
        [Get Submissions]
            - Asks SubMonitor Service to get submissions
            - The first time calling getSubmissions, will run assignFirst
            - Returns the submission queue
    */
    async getSubmissions() {
        let submissions;
        if (!this.submissionsAssigned) {
            submissions = await this.submissions.assignFirst();
            this.submissionsAssigned = true;
        } else {
            submissions = await this.submissions.checkAgain();
        }
        return this.submissions.submissions;
    }
    /*
        [Get Commands]
            - Asks ThreadFollower Service to get commands
            - The first time calling getCommands, will run assignFirst
            - Returns the command queue
    */
    async getCommands() {
        let commands;
        if (!this.commandsAssigned) {
            commands = await this.commands.assignFirst();
            this.commandsAssigned = true;
        } else {
            commands = await this.commands.checkAgain();
        }
        // this.commands.commands.enqueue(commands);
        return this.commands.commands;
    }
    getWikiEditor() {
        return this.wikieditor;
    }
    getRequester() {
        return this.requester;
    }

}