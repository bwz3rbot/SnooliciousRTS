const dotenv = require('dotenv').config({
    path: "pw.env"
});
const colors = require('colors');
const Snoolicious = require('./lib/Snoolicious');
console.log("Creating new Reddit Class.");
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
    switch (task.command.directive) {
        case 'help':
            console.log("command received was help. command: ".yellow, task.command);
            console.log("The priority level: ".yellow, task.priority);
            console.log("Received at this time: ".yellow, task.time);
            // await snoolicious.getRequester().getComment(task.item.id).reply("replying to the item!");
            break;
        default:
            console.log("Command was not understood! the command: ", task.command);
            console.log("The priority level: ", task.priority);
    }
}
/*
    [Handle Command]
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
    console.log("Bot Handling Task:".yellow, task.item.title);
    console.log("With priority level: ".yellow, task.priority);
    console.log("Got at this time: ".yellow, task.time);

}

/* [Snoolicious Example] */
const INTERVAL = ((60 * 1000) * process.env.INTERVAL);
async function run() {
        console.log("Running Test!!!".green);
        await snoolicious.getCommands(1);
        await snoolicious.getMentions(2);
        await snoolicious.getSubmissions(3);
        await snoolicious.getMultis(4);
        console.log("Size of the queue: ", snoolicious.tasks.size());
        await snoolicious.queryTasks(handleCommand, handleSubmission);
        console.log("Finished Quereying Tasks. Sleeping....".rainbow);
        setTimeout(() => {
            return run()
        }, (1000 * 25));
    }
    (async () => {
        await run();
    })();