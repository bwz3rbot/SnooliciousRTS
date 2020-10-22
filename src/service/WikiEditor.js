/* Wiki Editor */
const SnooMD = require('../util/SnooMD');
const md = new SnooMD();

/* 

https://not-an-aardvark.github.io/snoowrap/WikiPage.html#toc0__anchor

*/
module.exports = class WikiEditor {
    constructor(requester) {
        this.md = md;
        this.requester = requester;
        this.subreddit = process.env.MASTER_SUB;
    }
    /* [Get Wiki Page] */
    async getPage(page) {
        return this.requester.getSubreddit(this.subreddit).getWikiPage(page);
    }
    /* [Fetch Wiki Page] */
    async fetchPage(page) {
        return this.requester.getSubreddit(this.subreddit).getWikiPage(page).fetch();
    }
    /* [Refresh Wiki Page] */
    async refreshPage(page) {
        return this.requester.getSubreddit(this.subreddit).getWikiPage(page).fetch();
    }
    /* [Edit Wiki Page] */
    async editPage(page, text, reason, previousRevision) {
        return this.requester.getSubreddit(this.subreddit).getWikiPage(page).edit({
            text: text,
            reason: reason,
            previousRevision
        });
    }
    /* [Get Settings] */
    async getSettings(page) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).getSettings();
    }
    /* [Edit Settings] */
    async editSettings(page, listed, permissionLevel) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).editSettings({
            listed: listed,
            permission_level: permissionLevel
        });
    }
    /* [Add Editor] */
    async addEditor(page, editorName) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).addEditor({
            name: editorName
        });
    }
    /* [Remove Editor] */
    async removeEditor(page, editorName) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).removeEditor({
            name: editorName
        });
    }
    /* [Get Revisions] */
    async getRevisions(listingOptions) {
        return r.getSubreddit(this.subreddit).getRevisions(listingOptions);
    }
    /* [Hide Revisions] */
    async hideRevision(page, id) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).hideRevision({
            id
        });
    }
    /* [Revert] */
    async revert(page, id) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).revert({
            id
        });
    }
    /* [Get Discussions] */
    async getDiscussions(page, listingOptions) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).getDiscussions(listingOptions);
    }
    /* [toJSONPage] */
    async toJSONPage(page) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).toJSON();
    }
    /* [toJSONDiscussion] */
    async toJSONDiscussion(page, listingOptions) {
        return r.getSubreddit(this.subreddit).getWikiPage(page).getDiscussions(listingOptions).toJSON();
    }

}