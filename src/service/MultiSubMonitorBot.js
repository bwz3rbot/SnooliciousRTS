const Queue = require('../util/Queue');
/* 
    [Multi-Sub Monitor Class]
        1. Gets a list of subreddits from your pw.env file
        2. Requests the subreddits *new* section
        3. Assigns the first utc for each item on the list and sets it into a map with the name of the sub
        4. Checks again filtering items with utc > preivious utc
        5. pushes all items into the submissions queue.

    cutoff = the most recently received item's created_utc.
    When adding items to the array, checking the items created_utc
    against the value of cutoff will determine if the item is to be filtered

*/
module.exports = class MultiSubMonitor {
    constructor(requester) {
        this.requester = requester;
        this.startupLimit = process.env.STARTUP_LIMIT;
        this.submissionLimit = process.env.SUBMISSION_LIMIT;
        this.submissions = new Queue();

        // Split the string from the env file into a usable array
        this.SUBREDDITS = process.env.SUBREDDITS.split(',');
        this.ALL_SUBS = new Map();
        // Set UTC to false, then update when assigning the first
        for (let subreddit of this.SUBREDDITS) {
            this.ALL_SUBS.set(subreddit.trim(),
                false
            );
        }
    }
    /*
        [Get Submissions]
        - Loops over every sub in the ALL_SUBS map
        - Checks to see if their utc has been assigned,
        - Then assigns first, or checks again
    */
    async getSubmissions() {
        console.log("MultiSubMonitor Getting Submissions!".green);

        for (const [subreddit, utc] of this.ALL_SUBS) {
            if (utc === false) {
                console.log(`MultiSubMonitorBot -- Assigning the FIRST utc for sub: "${subreddit}"`.green);
                await this.assignFirst(subreddit);
            } else {
                console.log(`MultiSubMonitorBot -- Assigning the NEXT utc for sub: "${subreddit}"`.yellow);
                await this.checkAgain(subreddit, utc);
            }
        }

        return this.submissions;
    }
    /* 
        [Assign First UTC]
            - Checks the subreddit/new
            - Enqueues all the mentions
            - Assigns this.cutoff to the most recent utc
        */
    async assignFirst(subreddit) {
        // Get subreddit new
        const listing = await this.requester.getSubreddit(subreddit).getNew({
            limit: parseInt(this.startupLimit)
        });
        // Reverse the array and enqueue the mentions
        let previousUTC = this.ALL_SUBS.get(subreddit);
        listing.slice().reverse().forEach(submission => {
            if (submission.created_utc > previousUTC) {
                this.ALL_SUBS.set(subreddit, submission.created_utc);
                this.submissions.enqueue(submission);
            }
        });

        // const thisSubMostRecent = this.submissions.collection.filter(submission => submission.subreddit.display_name === subreddit).slice();
        // const nextUTC = thisSubMostRecent[thisSubMostRecent.length - 1].created_utc;
        // const latestSubmission = this.submissions.collection[this.submissions.size() - 1];

        // Return the queue
        return this.submissions;
    }
    /* 
        [Check Again]
            - Checks the subreddit/new
            - Filters out the old submissions
            - Enqueues the new submissions
     */
    async checkAgain(subreddit, utc) {
        // Check inbox
        const listing = await this.requester.getSubreddit(subreddit).getNew({
            limit: parseInt(this.submissionLimit)
        });
        // Filter items with created_utc > than the cutoff
        const newSubmissions = listing.filter(submission => submission.created_utc > utc).slice();
        // Reverse the array and enqueue the new mentions
        if (newSubmissions.length > 0) {
            newSubmissions.slice().reverse().forEach(submission => {
                if (submission.created_utc > utc) {
                    this.ALL_SUBS.set(subreddit, submission.created_utc);
                    this.submissions.enqueue(submission);
                }
            });
            // Set the new cutoff utc to the corresponding subreddit
            // const mostRecent = newSubmissions[newSubmissions.length - 1];

            // Find the largest utc in the array related to the current sub
            // const nextUTC = mostRecent.created_utc;

            // Set the subreddit's UTC
            // this.ALL_SUBS.set(subreddit, nextUTC);
            // Return the queue
            return this.submissions;
        }
    }
}