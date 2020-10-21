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
let firstUTCAssigned = false;
module.exports = class SubMonitor {
    constructor(requester) {
        this.sub = process.env.MASTER_SUB;
        this.requester = requester;
        this.startupLimit = process.env.STARTUP_LIMIT || 5;
        this.submissionLimit = process.env.SUBMISSION_LIMIT || 25;
        this.submissions = new Queue();
        this.cutoff = new Number();

    }
    /*
        [Get Submissions]
        - Loops over every sub in the ALL_SUBS map
        - Checks to see if their utc has been asigned,
        - Then assigns first, or checks again
    */
    async getSubmissions() {

        console.log("SubMonitorBot -- getting submissions".magenta);

        if (firstUTCAssigned === false) {
            console.log('assigned was false!'.red);
            console.log(`SubMonitorBot -- Assigning hte first utc!`.green);
            firstUTCAssigned = true;
            await this.assignFirst();

        } else {
            console.log("Value of assigned:", firstUTCAssigned);
            console.log(`SubMonitorBot -- Assigning the NEXT utc for sub ${this.sub}`.yellow);
            await this.checkAgain();
        }






    }
    /* 
        [Assign First UTC]
            - Checks the subreddit/new
            - Enqueues all the mentions
            - Assigns this.cutoff to the most recent utc
        */
    async assignFirst() {
        console.log("asigning first for this.sub: ", this.sub, "and this.startupLimit: ", this.startupLimit);
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