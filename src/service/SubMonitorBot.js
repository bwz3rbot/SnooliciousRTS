const Queue = require('../util/Queue');
/* [Sub Monitor Test] */
async function subMonitorTest() {
    console.log('RUNNING TEST'.rainbow);
    console.log("Creating a new sub monitor class instance.".magenta);
    bot = new SubMonitor();

    console.log("awaiting bot.assignFirst()".magenta);
    await bot.assignFirst();
    setInterval(async () => {
        await bot.checkAgain();

    }, 10000);
}

/* 
    [SubMonitor Class]
        1. Gets the subreddit/new
        2. Assigns the first utc
        3. Checks again filtering items with < preivious utc

    cutoff = the most recently received item's created_utc.
    When adding items to the array, checking the items created_utc
    against the value of cutoff will determine if the item is to be filtered

*/
module.exports = class SubMonitor {
    constructor(requester, sub, limit) {
        this.requester = requester;
        this.limit = limit | 5;
        this.submissions = new Queue();
        this.cutoff = new Number();
        this.sub = sub;

    }
    /* 
        [Assign First UTC]
            - Checks the subreddit/new
            - Enqueues all the mentions
            - Assigns this.cutoff to the most recent utc
        */
    async assignFirst() {
        // Check inbox
        const listing = await this.requester.getSubreddit(this.sub).getNew({
            limit: this.limit
        })
        // Reverse the array and enqueue the mentions
        listing.slice().reverse().forEach(submission => {
            this.submissions.enqueue(submission);
        });
        // Set the cutoff
        this.cutoff = this.submissions.collection[this.submissions.size() - 1].created_utc;
        // Return the queue
        return this.submissions;
    }

    /* 
        [Check Again]
            - Checks the subreddit/new
            - Filters out the old submissions
            - Enqueues the new submissions
     */
    async checkAgain() {
        // Check inbox
        const inbox = await this.requester.getSubreddit(this.sub).getNew({
            limit: 25
        });
        // Filter items with created_utc > than the cutoff
        const newSubmissions = inbox.filter(mention => mention.created_utc > this.cutoff).slice();
        // Reverse the array and enqueue the new mentions
        if (newSubmissions.length > 0) {
            newSubmissions.slice().reverse().forEach(mention => {
                this.submissions.enqueue(mention);
            });
            // Set the new cutoff utc
            this.cutoff = this.submissions.collection[this.submissions.size() - 1].created_utc;
            // Return the queue
            return this.submissions;
        }
    }
}