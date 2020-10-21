const dotenv = require('dotenv').config({
    path: "pw.env"
});
const colors = require('colors');
const Snoolicious = require('./lib/Snoolicious');
console.log("Creating new Reddit Class.");
const snoolicious = new Snoolicious();

/* 
    [Handle Command]
        - Passed in as the first argument to queryTasks()
        - Will be awaited for each item dequeued from the tasks queue which contains a value of 'body'
        - This will be true when calling both getCommands() and getMentions()
        - Reddit Submission objects do not contain a body key, so they will be sent to the handle submissions function instead

        [Command Task Object]
            - The Command Task object will be passed with these key/value pairs:
                task: {
                    command: { 
                        directive,
                        [arg1, arg2, arg3, ...]
                    },
                    item: {
                        <Reddit Comment Object>
                    },
                    priority: <Number you set when calling getCommands or getMentions>,
                    time: <new Date>
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
        - Awaited for each submission dequeued from the task queue

        [Submission Task Object]
            - The Submission Task object will be passed with these key/value pairs:
                task: {
                    item: {
                        <Reddit Submission Object>
                    },
                    priority: <Number you set when calling getCommands or getMentions>,
                    time: <new Date>
                }
*/
async function handleSubmission(task) {
    console.log("Bot Handling Task:".yellow, task.item.title);
    console.log("With priority level: ".yellow, task.priority);
    console.log("Got at this time: ".yellow, task.time);

}


/* Run Test */
(async () => {
    console.log("Running Test!!!".green);
    // await snoolicious.getCommands();
    // await snoolicious.getMentions();
    await snoolicious.getMultis();
    // await snoolicious.queryTasks(handleCommand, handleSubmission);
    console.log("Sleeping....".rainbow);
    setInterval(async () => {
        console.log("getting more mentions...".magenta);
        // await snoolicious.getCommands();
        // await snoolicious.getMentions();
        await snoolicious.getMultis();
        await snoolicious.queryTasks(handleCommand, handleSubmission);
    }, 10000);


})();