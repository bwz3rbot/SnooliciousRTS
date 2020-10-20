const Queue = require('../util/Queue');
/* [Thread Follower Test] */
async function threadFollowerTest() {
    console.log('RUNNING TEST'.rainbow);
    console.log("Creating a new thread follower class instance.".magenta);
    bot = new ThreadFollower();

    console.log("awaiting bot.assignFirst()".magenta);
    await bot.assignFirst();
    setInterval(async () => {
        await bot.checkAgain();
    }, 10000);
}

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
module.exports = class ThreadFollower {
    constructor(requester, threadId, limit) {
        this.requester = requester;
        this.limit = limit | 5;
        this.commands = new Queue();
        this.cutoff = new Number();
        this.threadId = threadId;

    }
    /* 
        [Assign First UTC]
            - Checks the subreddit/new
            - Enqueues all the mentions
            - Assigns this.cutoff to the most recent utc
        */
    async assignFirst() {
        console.log("ThreadFollower Service assigning the first utc...".yellow);
        // Get the thread and set suggested sort to new
        const thread = await this.requester.getSubmission(this.threadId)
            .setSuggestedSort('new')
            .fetch();
        // Reverse the array and enqueue the mentions
        console.log("enqueing commands while i < ", this.limit);
        let i = 0;
        const commands = thread.comments.slice(0, this.limit);
        commands.slice().reverse().forEach(command => {
            if (i++ < this.limit) {
                console.log({
                    i,
                    limit: this.limit
                });
                this.commands.enqueue(command);
            }

        });
        console.log("finished enqueuing the first set of commands");
        console.log("Size of the command queue: ", this.commands.size());
        console.log("length of the queue: ", this.commands.collection.length);
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
        console.log("Checking again!".magenta);
        // Check inbox
        const thread = await this.requester.getSubmission(process.env.THREAD_ID).fetch();
        // Filter items with created_utc > than the cutoff
        console.log("checking that command.created_utc is > ".magenta, this.cutoff);
        const newCommands = thread.comments.filter(command => command.created_utc > this.cutoff).slice();
        // Reverse the array and enqueue the new mentions

        if (newCommands.length > 0) {
            console.log("new commands present. enqueueing them.".green);
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