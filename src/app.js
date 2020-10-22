const dotenv = require('dotenv').config({
    path: "pw.env"
});
const Database = require('./data/sqlite.config');
const db = new Database('saved');
const colors = require('colors');
const Snoolicious = require('./lib/Snoolicious');
const snoolicious = new Snoolicious();

/* 
    [Handle Command]
        - This function must be passed in as the first argument to snoolicious.queryTasks()
        - handleCommand be awaited by Snoolicious for each command dequeued from the task queue
        - This will be true when calling either the getCommands or getMentions functions, as they both return built commands
        - Reddit Submission objects do not contain a body key, rather they will be sent to the handleSubmissions function instead

        [Command Task Object]
            - The Command Task object will be passed to this function with these key/value pairs:
                task: {
                    command: { 
                        directive,
                        [arg1, arg2, arg3, ...]
                    },
                    item: {
                        <Reddit Comment Object>
                    },
                    priority: <Number you set when calling getCommands or getMentions>,
                    time: <new Date().getTime()>
                }
*/
async function handleCommand(task) {
    const id = `${task.item.parent_id}${task.item.id}${task.item.created_utc}`;
    const checkedId = await db.checkID(id);
    // Check if the item was saved first.
    if (!checkedId) {
        console.log("New Command recieved: ".yellow);
        switch (task.command.directive) {
            case 'help':
                console.log("Command was help!".green, task.command);
                // await snoolicious.getRequester().getComment(task.item.id).reply("replying to the item!");
                break;
            default:
                console.log("Command was not understood! the command: ".red, task.command);
        }
        // Save the item so snoolicious won't process it again.
        console.log("saving");
        await db.saveID(id);
    } else {
        console.log("Item was already saved!".red);
    }
}
/*
    [Handle Submission]
        - Passed in as the second argument to queryTasks()
        - Awaited by Snoolicious for each submission dequeued from the task queue

        [Submission Task Object]
            - The Submission Task object will be passed with these key/value pairs:
                task: {
                    item: {
                        <Reddit Submission Object>
                    },
                    priority: <Number you set when calling getCommands or getMentions>,
                    time: <new Date().getTime()>
                }
*/
async function handleSubmission(task) {
    const id = `${task.item.parent_id}${task.item.id}${task.item.created_utc}`;
    const checkedId = await db.checkID(id);
    // Check if the item was saved first.
    if (!checkedId) {
        switch (task.item.subreddit.display_name) {
            case 'Bwz3rBot':
                console.log("Came from r/Bwz3rBot.".green);

                break;
            case 'IntWatch':
                console.log("Came from r/IntWatch".red);
                break;
            case 'AnotherBotFarm':
                console.log("Came from r/AnotherBotFarm");
                break;
            default:
                console.log("Came from another sub!".yellow);
                break;
        }
        console.log("saving");
        await db.saveID(id);
    } else {
        console.log("Item was already saved".red);
    }
}

/* [Snoolicious Run Cycle] */
const INTERVAL = (process.env.INTERVAL * 1000);
async function run() {
        console.log("Running Test!!!".green);
        // await snoolicious.getCommands(1);
        // await snoolicious.getMentions(2);
        // await snoolicious.getSubmissions(3);
        await snoolicious.getMultis(4);
        console.log("Size of the queue: ", snoolicious.tasks.size());
        await snoolicious.queryTasks(handleCommand, handleSubmission);
        console.log(`Finished Quereying Tasks. Sleeping for ${INTERVAL/1000} seconds...`.rainbow);
        setTimeout(async () => {
            await run()
        }, (INTERVAL));
    }
    (async () => {
        await run();
    })();