const Queue = require('../util/Queue');
/* 
    [Thread Follower Class]
        1. Gets the submission
        2. Sets suggested sort to new
        3. Assigns the first utc
        4. Checks again filtering items with < preivious utc

    cutoff = the most recently received item's created_utc.
    When adding items to the array, checking the items created_utc
    against the value of cutoff will determine if the item is to be filtered

*/
let firstUTCAssigned = false;
module.exports = class CommandBot {
    constructor(requester) {
        this.requester = requester;
        this.startupLimit = process.env.STARTUP_LIMIT | 5;
        this.commands = new Queue();
        this.cutoff = new Number();
        this.threadId = process.env.THREAD_ID;
    }

    /*
        [Get Commands]
    */
    async getCommands() {
        if (!firstUTCAssigned) {
            console.log("CommandBot -- Assigning the FIRST utc...".green);
            firstUTCAssigned = true;
            return this.assignFirst();
        } else {
            console.log("CommandBot -- Assigning the NEXT utc...".yellow);
            return this.checkAgain();
        }
    }
    /* 
        [Assign First UTC]
            - Checks the subreddit/new
            - Enqueues all the mentions
            - Assigns this.cutoff to the most recent utc
        */
    async assignFirst() {
        // Get the thread and set suggested sort to new
        const thread = await this.requester.getSubmission(this.threadId)
            .setSuggestedSort('new')
            .fetch();
        // If no comments exist, make the first comment to avoid errors.
        if (thread.comments.length === 0) {
            await this.requester.getSubmission(this.threadId).reply("____beep boop____.");
            // Recurisvly run this function after the length of comments is no longer 0
            return this.assignFirst();
        }
        // Reverse the array and enqueue the mentions
        let i = 0;
        const commands = thread.comments.slice(0, this.startupLimit);
        commands.slice().reverse().forEach(command => {
            if (i++ < this.startupLimit) {
                this.commands.enqueue(command);
            }
        });
        // Set the cutoff
        this.cutoff = this.commands.collection[this.commands.size() - 1].created_utc;
        // Return the queue
        return this.commands;
    }

    /* 
        [Check Again]
            - Checks the subreddit/new
            - Filters out the old submissions
            - Enqueues the new submissions
     */
    async checkAgain() {
        // Check the thread
        const thread = await this.requester.getSubmission(process.env.THREAD_ID)
            .fetch();

        // Filter items with created_utc > than the cutoff
        const newCommands = thread.comments.filter(command => command.created_utc > this.cutoff).slice();
        // Reverse the array and enqueue the new mentions
        if (newCommands.length > 0) {
            newCommands.slice().reverse().forEach(command => {
                this.commands.enqueue(command);
            });
            // Set the new cutoff utc
            this.cutoff = this.commands.collection[this.commands.size() - 1].created_utc;
            // Return the queue
            return this.commands;
        }
    }
}