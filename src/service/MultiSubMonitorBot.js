const Queue = require('../util/Queue');
function max(input) {
    if (toString.call(input) !== "[object Array]")  
      return false;
 return Math.max.apply(null, input);
   }
/* 
    [Multi-Sub Monitor Class]
        1. Gets a list of subreddits from your pw.env file
        2. Requests the subreddits *new* section
        3. Assigns the first utc for each item on the list
        4. Checks again filtering items with < preivious utc
        5. pushes all items into the queue.

    cutoff = the most recently received item's created_utc.
    When adding items to the array, checking the items created_utc
    against the value of cutoff will determine if the item is to be filtered

*/
module.exports = class MultiSubMonitor {
    constructor(requester) {
        this.requester = requester;
        this.startupLimit = process.env.STARTUP_LIMIT || 5;
        this.submissionLimit = process.env.SUBMISSION_LIMIT || 25;
        this.submissions = new Queue();
        this.SUBREDDITS = process.env.SUBREDDITS.split(',');
        this.ALL_SUBS = new Map();
        for (let subreddit of this.SUBREDDITS) {
            this.ALL_SUBS.set(subreddit.trim(),
                false
            );
        }
        console.log("finished constructing the object.".yellow, this);
    }
    /*
        [Get Submissions]
        - Loops over every sub in the ALL_SUBS map
        - Checks to see if their utc has been assigned,
        - Then assigns first, or checks again
    */
    async getSubmissions() {
        console.log("SubMonitorBot -- getting submissions".magenta);
        console.log("looping over this map: ", this.ALL_SUBS);
        for await (const [subreddit, utc] of this.ALL_SUBS) {
            if (utc === false) {
                console.log('utc was false!'.red);
                console.log(`subreddit:${subreddit} utc:${utc}`);
                console.log(`MultiSubMonitorBot -- Assigning hte first utc for sub: "${subreddit}"`.green);
                await this.assignFirst(subreddit);
                const updated = this.ALL_SUBS.get(subreddit);
                console.log(`Finished assigning the first utc for subreddit:${subreddit} & utc:${updated}`);
                console.log(this.ALL_SUBS.get(subreddit));
            } else {
                console.log(`Assigning next utc for sub:${subreddit}, current utc:${utc}`);
                await this.checkAgain(subreddit, utc);
            }
        }
    }
    /* 
        [Assign First UTC]
            - Checks the subreddit/new
            - Enqueues all the mentions
            - Assigns this.cutoff to the most recent utc
        */
    async assignFirst(subreddit) {
        // Check inbox
        console.log(`ASSIGNING THE FIRST UTC FOR "${subreddit}"`);
        const listing = await this.requester.getSubreddit(subreddit).getNew({
            limit: parseInt(this.startupLimit)
        });
        // Reverse the array and enqueue the mentions
        listing.slice().reverse().forEach(submission => {
            console.log("got this submission: ".yellow, {
                title: submission.title,
                utc: submission.created_utc
            })
            this.submissions.enqueue({
                subreddit,
                submission
            });
        });
        // Set the cutoff
        console.log(`Setting the initial cutoff for sub:${subreddit}`.magenta);

        const latestSubmission = this.submissions.collection[this.submissions.size() - 1];
        console.log(`Setting the cutoff for ${subreddit} to be: ${latestSubmission.submission.created_utc}`);
        this.ALL_SUBS.set(subreddit, latestSubmission.submission.created_utc);
        console.log("All subs: ", this.ALL_SUBS);
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
        const inbox = await this.requester.getSubreddit(subreddit).getNew({
            limit: parseInt(this.submissionLimit)
        });
        // Filter items with created_utc > than the cutoff
        const newSubmissions = inbox.filter(submission => submission.created_utc > utc).slice();
        // Reverse the array and enqueue the new mentions
        if (newSubmissions.length > 0) {
            newSubmissions.slice().reverse().forEach(submission => {
                this.submissions.enqueue({
                    subreddit,
                    submission
                });
            });
            // Set the new cutoff utc to the corresponding subreddit
            const thisSubMostRecent = this.submissions.collection.filter(sub => sub.subreddit === subreddit).slice();
            console.log("got this most recent: ", thisSubMostRecent);
            // Find the largest utc in the array related to the current sub
            const nextUTC = thisSubMostRecent[thisSubMostRecent.length-1].submission.created_utc;

            console.log(`${subreddit} most recent submission was:`);
            console.log(`title:${thisSubMostRecent[thisSubMostRecent.length-1].submission.title} utc:${thisSubMostRecent[thisSubMostRecent.length-1].submission.created_utc}`);

            // const cutoff = thisSubMostRecent.submission.created_utc;
            console.log("the cutoff: ", nextUTC);
            // const cutoff = thisSubMostRecent[this.submissions.size() - 1].submission.created_utc;
            this.ALL_SUBS.set(subreddit, nextUTC);
            // Return the queue
            return this.submissions;
        }
    }
}