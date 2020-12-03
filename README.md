<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=300px src="https://imgur.com/ciey6EG.jpg" alt="Project logo"></a>
</p>

<h1 align="center">Snoolicious RTS v1</h1>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> Snoolicious Reddit Tool Suite is a fully fledged bot framework complete with four seperate methods of getting commands to your bot, a command validator utility, a wiki editor service, pre-configured <a href="https://www.npmjs.com/package/better-sqlite3">better-sqlite3</a> module for you to update per-project, <a href='https://github.com/web-temps/SnooMD'>SnooMD Reddit Flavour Markdown Editor</a>, and direct access to the incredible library <a href="https://github.com/not-an-aardvark/snoowrap">Snoowrap</a>.<br>
Snoolicious RTS has everything you need to get started building your bot to interact with the Reddit API.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Usage](#usage)
- [Getting Started](#getting_started)
  - [Prerequisites](#prereq)
  - [Setting Up Your Script App](#script_app)
  - [Environment Variables](#env_var)


# About <a name = "about"></a>

Writing bots can be tricky. Not to mention time consuming! This project aims to simplify the entire process. I've taken the hard work out for you combined all the templates and utilities I've created into one big module. Just import Snoolicious and you will have access to my entire __Reddit Tool Suite__. This project will be updated from time to time when I create new utilities or learn new tricks that I would like to keep using in my future projects. Feel free to use it as you please, create a pull request to add your own utilities and share ideas. This is Github, after all. A place for developers to collaborate and make open source projects better for the people who use them!

# Usage <a name="usage"></a>

Using the services and utilities I've included in this project are incredibly easy. Just set up your bot account as described later on in the readme, set up your pw.env file and then start coding. At the bottom of this example code is the __Snoolicious Run Cycle__. It's the basics of how your bot is going to function. You set up your dotenv config file, and the bot will automatically know how to __get commands__, __get mentions__, __get submissions__, and even __get multis__. You simply tell the code to run in a recursive cycle, plop in your callbacks, and the __handle command__ function will be awaited for each command or mention received. Mentions will be stripped of their username, and you will be left with a __command object__, and the __Reddit API Object__ from which it came. If you are calling __get multis__ or __get submissions__, the __handle submission__ function will be triggered instead. You will be passed a __Reddit Object__. Use the priority queue as you wish, it is not nececary. It will be updated to be more useful in the future. For now, get creative with it if you like. Submit a pull request if you think of something nice to use it for.\
See the example below for how to format a __*Snoolicious*__ project:


```javascript
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
    const isSaved = await snoolicious.requester.getComment(task.item).saved;
    // Check if the item was saved first.
    if (!isSaved) {
        console.log("New Command recieved: ".yellow);
        switch (task.command.directive) {
            case 'help':
                console.log("Command was help!".green, task.command);
                await snoolicious.getRequester().getComment(task.item.id).reply("sending help!");
                break;
            default:
                console.log("Command was not understood! the command: ".red, task.command);
        }
        // Save the item so snoolicious won't process it again.
        console.log("saving");
        await snoolicious.requester.getComment(task.item.id).save();
    } else {
        console.log("Item was already saved!".red);
    }
    console.log("Size of the queue: ", snoolicious.tasks.size());

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
let count = 0;
async function handleSubmission(task) {
    console.log("RECEIVED TASK!");
    console.log(`title:${task.item.title}`.green);
    const saved = await snoolicious.requester.getSubmission(task.item.id).saved;
    console.log("was already saved: ", saved);
    if (!saved) {
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
        await snoolicious.requester.getSubmission(task.item.id).save();
    } else {
        console.log("Item was already saved".red);
    }
    console.log("Size of the queue: ", snoolicious.tasks.size());
    console.log("TOTAL TASKS COMPLETED: ", ++count);

}

/* [Snoolicious Run Cycle] */
const INTERVAL = (process.env.INTERVAL * 1000);
async function run() {
        console.log("Running Test!!!");
        await snoolicious.getCommands(1);
        await snoolicious.nannyUser('bwz3r', 1);
        await snoolicious.getMentions(2);
        await snoolicious.getSubmissions(3);
        await snoolicious.getMultis(4);
        console.log("APP CHECKING SIZE OF TASKS QUEUE: ".america, snoolicious.tasks.size());
        await snoolicious.queryTasks(handleCommand, handleSubmission);
        console.log(`Finished Quereying Tasks. Sleeping for ${INTERVAL/1000} seconds...`.rainbow);
        setTimeout(async () => {
            await run()
        }, (INTERVAL));
    }
    (async () => {
        await run();
    })();
```

# Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites <a name = "prereq"></a>

This project is built with Node.JS. Download the latest version [here](https://nodejs.org/en/download/). Now download the code from this repo and use `npm i` to install the dependencies required to develop and run your bot.


## Setting Up Your Script App <a name = "script_app"></a>

You'll have to create a new account for your bot before you move any further.\
Once the account is created, log in, go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) to fill out the form to create a new script app.


<img src='https://i.imgur.com/yq8akJ7.png'>

## Environment Variables <a name = "env_var"></a>
-----



This project requires __dotenv__. dotenv is a package that allows a developer to store environment variables on the __process.env__ property. You create your .env file in the root folder of your project require the dependency and point it to your file upon running the app. dotenv will attach these variables to the process.env property. Now all of your javascript files will have access to these variables, no matter where they lie on the directory tree. This allows your bots to be written to be customizable for others to use, and also adds a layer of security by allowing you to store sensitive data (like passwords or client auth codes) outside of your source code. You should never include these types of information in your code, as you will likely be uploading them to Github. You should always always *always* put sensitive data into your .env files and then promptly add them to the .gitignore. You'll thank me later!\ meme
<br>
You must include a .env with these variables in your root folder for the bot to function. You may also add on your own variables here. You can call them from anywhere in your code by calling ```process.env.<variable name>```. Read more about dotenv [here](https://www.npmjs.com/package/dotenv).\
<br>
___
Now that you've set up your bot account and created a script app, it's time to download the source code and paste in your environment variables.\
Also have open reddit.com/prefs/apps as you'll need to copy & paste the items you'll find there.

<br>

__USER_AGENT__ is just a name that the server will identify your bot by. It can be whatever you want.\
__CLIENT_ID__ and __CLIENT_SECRET__ are fround in prefs/apps.\
__REDDIT_USER__ is your bots username.\
__REDDIT_PASS__ is its password.\
__MASTER_SUB__ is the subreddit the SubMonitor Service will work on.\
__SUBREDDITS__ are the subreddits MultiSubMonitor will work on.\
__DEBUG_CODE__ and __DEBUG_NETWORK__ should be set to false unless any problems arise.\
__STARTUP_LIMIT__ will cause the bot to check this many items on the first sweep. Setting this value higher will ensure that when stopping and restarting the bot, no requests are forgotten. This value may be set up to 100\
__NANNY_USER__ the username of the redditor the NannyBot will follow.\
__SUBMISSION_LIMIT__ Will limit the amount of tasks the __SubMonitorBot Service__ and __MultiSubMonitor Service__ will generate on each sweep after the first. On very active subs with many submissions per minute, this option may be set up to 100.\
__USER_SUBMISSION_LIMIT__ Will be used by the NannyBot service.\
__MENTIONS_LIMIT__ limits the amount of tasks the __MentionBot Service__ will generate after the first pass.\
__COMMAND_PREFIX__ A single character (preferably symbol) string that the bot will listen for commands with.\
__INTERVAL__ The time (in seconds) which the bot should sleep between doing its job again. Easily changed to minutes for production by simply multiplying the value by 60 before pushing out your code.\
__THREAD_ID__ You will have to go into your subreddit and create a new thread. I suggest pinning it so that users can see it and easily use it. Once it is created you'll have to copy and paste the id from the url bar into this field. The __CommandBot Service__ works by latching onto this thread and setting suggested sort to new, then continously streaming in the latest requests and handling them in a queue. This function requires the bot to have permission set to `Posts` to not receive an error. The value may be changed at any time if you decide to start a new command thread.\
See the below example of a url. The id will be used in the pw.envEXAMPLE file as a reference. Copy the id from the thread you create just like this one:
```
https://www.reddit.com/r/Bwz3rBot/comments/ja6v32/bot_command_thread/
```




```javascript
USER_AGENT="YOUR BOT'S USERNAME"
CLIENT_ID="FROM PREFS/APPS"
CLIENT_SECRET="FROM PREFS/APPS"
REDDIT_USER="YOUR BOT'S USERNAME"
REDDIT_PASS="YOUR BOT'S PASSWORD"
MASTER_SUB="Bwz3rBot"
SUBREDDITS="Bwz3rBot, IntWatch, AnotherBotFarm"
DEBUG_CODE="false"
DEBUG_NETWORK="false"
STARTUP_LIMIT="15"
NANNY_USER="bwz3r"
SUBMISSION_LIMIT="50"
USER_SUBMISSION_LIMIT='25'
MENTIONS_LIMIT="50"
COMMAND_PREFIX="!"
INTERVAL="5"
THREAD_ID="ja6v32"
```


    


Once these fields are completely filled out, remove <i>EXAMPLE</i> from the end of the filename.


> pw.envEXAMPLE = pw.env
_____
