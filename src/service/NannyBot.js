const Queue = require('../util/Queue');
/* 
    [Mention Bot Class]
        1. Gets inbox
        2. Assigns the first utc
        3. Checks again filtering items with < preivious utc

    cutoff = the most recently received item's created_utc.
    When adding items to the array, checking the items created_utc
    against the value of cutoff will determine if the item is to be filtered

*/
let firstUTCAssigned = false;
module.exports = class MentionBot {
    constructor(requester) {
        this.requester = requester;
        this.startupLimit = process.env.STARTUP_LIMIT;
        this.submissionsLimit = process.env.USER_SUBMISSION_LIMIT;
        this.posts = new Queue();
        this.cutoff = new Number();
    }
    /*
        [Get Commands]
    */
    async getUserPosts(user) {
        if (!firstUTCAssigned) {
            firstUTCAssigned = true;
            return this.assignFirst(user);
        } else {
            return this.checkAgain(user);
        }
    }
    /* 
        [Assign First UTC]
            - Checks the inbox
            - Filters only mentions
            - Enqueues all the mentions
            - Assigns this.cutoff to the most recent utc
        */
    async assignFirst(user) {
        // Check inbox
        const listing = await this.requester.getUser(user).getSubmissions({
            limit: parseInt(this.startupLimit)
        });
        // Reverse the array and enqueue the mentions, set the new UTC
        listing.slice().reverse().forEach(post => {
            this.posts.enqueue(post);
            if (post.created_utc > this.cutoff) {
                this.cutoff = post.created_utc;
            }
        });
        return this.posts;
    }
    /* 
        [Check Again]
            - Checks the inbox
            - Filters out the old messages
            - Enqueues the new messages
     */
    async checkAgain(user) {
        // Check inbox
        const listing = await this.requester.getUser(user).getSubmissions({
            limit: parseInt(this.submissionsLimit),
            after: this.cutoff
        });
        // Filter items with created_utc > than the cutoff
        const newPosts = listing.filter(post => post.created_utc > this.cutoff).slice();
        // Reverse the array and enqueue the new mentions, set the new UTC
        if (newPosts.length > 0) {
            newPosts.slice().reverse().forEach(post => {
                this.posts.enqueue(post);
                if (post.created_utc > this.cutoff) {
                    this.cutoff = post.created_utc;
                }
            });
            // Return the queue
            return this.posts;
        }
    }
}