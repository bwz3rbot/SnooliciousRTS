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
module.exports = class MentionBot {
    constructor(requester, startupLimit, mentionsLimit) {
        this.requester = requester;
        this.startupLimit = startupLimit || 5;
        this.mentionsLimit = mentionsLimit || 25;
        console.log("Mentions limit set to: ", this.mentionsLimit);
        this.mentions = new Queue();
        this.cutoff = new Number();
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
        console.log("MentionBot Service assigning the first utc...".magenta);
        const inbox = await this.requester.getInbox({
            filter: 'mentions',
            limit: parseInt(this.startupLimit)
        });
        let i = 0;
        // Reverse the array and enqueue the mentions
        inbox.slice().reverse().forEach(mention => {
            this.mentions.enqueue(mention);
        });
        // Set the cutoff
        this.cutoff = this.mentions.collection[this.mentions.size() - 1].created_utc;
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
        console.log("The size of this thing: ", inbox.length);
        // Filter items with created_utc > than the cutoff
        const newMentions = inbox.filter(mention => mention.created_utc > this.cutoff).slice();
        // Reverse the array and enqueue the new mentions
        if (newMentions.length > 0) {
            newMentions.slice().reverse().forEach(mention => {
                this.mentions.enqueue(mention);
            });
            // Set the new cutoff utc
            this.cutoff = this.mentions.collection[this.mentions.size() - 1].created_utc;
            // Return the queue
            return this.mentions;
        }
    }
}