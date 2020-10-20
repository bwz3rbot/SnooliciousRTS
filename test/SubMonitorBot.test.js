const dotenv = require('dotenv').config({
    path: "pw.env"
});
const colors = require('colors');
const Reddit = require('../src/lib/Reddit');



/* Get Mentions Test */

(async () => {
    console.log("Running sub monitor test".rainbow);
    console.log("creating new reddit object".magenta);
    reddit = new Reddit();
    console.log("First time getting commands from test".magenta);
    const submissions = await reddit.getSubmissions();
    console.log("App Finished the first sweep.".magenta);

    let i = 0;
    while (!submissions.isEmpty()) {
        console.log("submissions queue size: ", submissions.size());
        const submission = (i, submissions.dequeue());
        console.log({
            body: submission.title,
            created_utc: submission.created_utc
        });
    }

    setInterval(async () => {
        console.log("Getting more commands from app.js".magenta);
        const submissions = await reddit.getSubmissions();
        let i = 0;
        console.log("commands queue size:", submissions.size());
        console.log("commands collection length:", submissions.collection.length);
        while (!submissions.isEmpty()) {
            console.log("command queue size: ", submissions.size());
            const submission = (submissions.dequeue());
            console.log({
                i: i++,
                body: submission.title,
                created_utc: submission.created_utc
            });
        }

    }, 5000);

})();