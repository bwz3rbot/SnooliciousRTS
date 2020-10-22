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
        this.startupLimit = process.env.STARTUP_LIMIT || 5;
        this.mentionsLimit = process.env.MENTIONS_LIMIT || 25;
        this.mentions = new Queue();
        this.cutoff = new Number();
    }
    /*
        [Get Commands]
    */
    async getMentions() {
        if (!firstUTCAssigned) {
            console.log("MentionBot -- Assigning the FIRST utc...".green);
            firstUTCAssigned = true;
            return this.assignFirst();
        } else {
            console.log("MentionBot -- Assigning the NEXT utc...".yellow);
            return this.checkAgain();
        }
    }
    /* 
        [Assign First UTC]
            - Checks the inbox
            - Filters only mentions
            - Enqueues all the mentions
            - Assigns this.cutoff to the most recent utc
        */
    async assignFirst() {
        // Check inbox
        const inbox = await this.requester.getInbox({
            filter: 'mentions',
            limit: parseInt(this.startupLimit)
        });
        // Reverse the array and enqueue the mentions, set the new cutoff UTC
        inbox.slice().reverse().forEach(mention => {
            if (mention.created_utc > this.cutoff) {
                this.cutoff = mention.created_utc;
                this.mentions.enqueue(mention);
            }
        });
        // Return the queue
        return this.mentions;
    }

    /* 
        [Check Again]
            - Checks the inbox
            - Filters out the old messages
            - Enqueues the new messages
     */
    async checkAgain() {
        // Check inbox
        const inbox = await this.requester.getInbox({
            filter: 'mentions',
            limit: parseInt(this.mentionsLimit)
        });
        // Filter items with created_utc > than the cutoff
        const newMentions = inbox.filter(mention => mention.created_utc > this.cutoff).slice();
        // Reverse the array and enqueue the new mentions, set the new cutoff UTC
        if (newMentions.length > 0) {
            newMentions.slice().reverse().forEach(mention => {
                if (mention.created_utc > this.cutoff) {
                    this.cutoff = mention.created_utc;
                    this.mentions.enqueue(mention);
                }
            });
            // Return the queue
            return this.mentions;
        }
    }
}