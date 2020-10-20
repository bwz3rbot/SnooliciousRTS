const Queue = require('../util/Queue');
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
    constructor(requester, sub, startupLimit, submissionLimit) {
        this.requester = requester;
        this.startupLimit = startupLimit || 5;
        console.log("startup limit set to: ", this.startupLimit);
        this.submissionLimit = submissionLimit || 25;
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
            limit: parseInt(this.startupLimit)
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
            limit: parseInt(this.submissionLimit)
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