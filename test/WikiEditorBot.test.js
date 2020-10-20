const dotenv = require('dotenv').config({
    path: "pw.env"
});
const colors = require('colors');
const Reddit = require('../src/lib/Reddit');

/* Wiki Editor Test */
(async () => {
    console.log("Running sub monitor test".rainbow);
    console.log("creating new reddit object".magenta);
    reddit = new Reddit();
    console.log("First time getting commands from test".magenta);
    const wiki = await reddit.getWikiEditor().getWikiPage('userdirectory');
    console.log(wiki);
    
})();