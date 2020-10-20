<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=300px src="https://imgur.com/ciey6EG.jpg" alt="Project logo"></a>
</p>

<h1 align="center">Snoolicious RTS</h1>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> Snoolicious Reddit Tool Suite is a fully fledged bot framework complete with three different ways of getting commands to your bot, a command validator tool, a wiki editor, <a href='https://github.com/web-temps/SnooMD'>SnooMD Reddit Flavour Markdown Editor</a>, and direct access to the incredible library <a href="https://github.com/not-an-aardvark/snoowrap">Snoowrap</a>.<br>
Snoolicious RTS has everything you need to get started building your bot to interact with the Reddit API.
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
  - [Prerequisites](#prereq)
  - [Setting Up Your Script App](#script_app)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [TODO](../TODO.md)
- [Contributing](../CONTRIBUTING.md)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

# About <a name = "about"></a>

Writing bots can be tough. Not to mention time consuming! This project simplifies the whole process. I've taken all the hard work out for you combined all the templates and utilities I've created into one big module. Just import Reddit and you will have access to my entire __Reddit Tool Suite__. This project will be updated from time to time when I create new utilities or learn new tricks that I would like to keep using in my future projects. Feel free to use it as you please, create a pull request to add your own utilities and share ideas. This is Github, after all. A place for developers to collaborate and make open source projects better for the rest of us!


# Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites <a name = "prereq"></a>

This project is built with Node.JS. Download the latest version [here](https://nodejs.org/en/download/). Now download the code from this repo and use `npm i` to install the dependencies required to run your bot.


## Setting Up Your Script App <a name = "script_app"></a>

You'll have to create a new account for your bot before you move any further.\
Once the account is created, log in, go to [reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) to fill out the form to create a new script app.


<img src='https://i.imgur.com/yq8akJ7.png'>

## Environment Variables <a name = "env_var"></a>

This project requires __dotenv__. dotenv is a package that allows a developer to store environment variables on the __process.env__ property. You create your .env file in the main folder and require the dependency upon running the app. All your javascript files will have access to these variables, no matter where they lie on the directory tree. It allows your bots to be written to be customizable for others to use, and also adds a layer of security by allowing you to store sensitive data (like passwords or client auth codes) outside of your source code.
You must include a __pw.env__ file with these variables in your root folder for the bot to function. You may also add on your own variables here. You can call them from anywhere in your code by calling ```process.env.<variable name>```. Read more about dotenv [here](https://www.npmjs.com/package/dotenv).\
Now that you've set up your bot account and created a script app, it's time to download the source code and paste in your environment variables.

Download the .zip file containing the source code on this page. Unzip it and save it to your computer somewhere. Now open up the pw.envEXAMPLE file.\
Also have open reddit.com/prefs/apps as you'll need to copy/paste the items you'll find there.\
__USER_AGENT__ is just a name that the server will identify your bot by. It can be whatever you want.\
__CLIENT_ID__ and __CLIENT_SECRET__ are fround in prefs/apps.\
__REDDIT_USER__ is your bots username.\
__REDDIT_PASS__ is its password.\
__MASTER_SUB__ is the subreddit it will work on.\
__DEBUG_CODE__ and __DEBUG_NETWORK__ should be set to false unless any problems arise.\
__STARTUP_LIMIT__ will cause the bot to check this many items per sweep. It takes a bit longer to start up, but can accomodate for more requests the higher you set it. Setting this value higher will ensure that when stopping and restarting the bot, no requests are forgotten. This value may be set up to 100\
__SUBMISSION_LIMIT__ Will cause the bot to check for more submissions each sweep after the first. On very active subs with many submissions per minute, this option may be set up to 100.
__COMMAND_PREFIX__ A single character (preferably symbol) string that the bot will listen for commands with.\
__THREAD_ID__ You will have to go into your subreddit and create a new thread. I suggest pinning it so that users can see it and easily use it. Once it is created you'll have to copy and paste the id from the url bar into this field. The __CommandBot Service__ works by latching onto this thread and setting suggested sort to new, then continously streaming in the latest requests and handling them in a queue. This function requires the bot to have permission set to `Posts` to not receive an error. The value may be changed at any time if you decide to start a new command thread.\
See the below example of a url. The id will be used in the pw.envEXAMPLE file as a reference. Copy the id from the thread you create just like this one:

```
https://www.reddit.com/r/Bwz3rBot/comments/ja6v32/bot_command_thread/
```





USER_AGENT=''\
CLIENT_ID=''\
CLIENT_SECRET=''\
REDDIT_USER=''\
REDDIT_PASS=''\
MASTER_SUB='Bwz3rBot'\
DEBUG_CODE='false'\
DEBUG_NETWORK='false'\
STARTUP_LIMIT='7'\
SUBMISSION_LIMIT='25'\
MENTIONS_LIMIT='25'\
THREAD_ID='jejlbe'\
COMMAND_PREFIX="!"\
    


Once these fields are completely filled out, remove <i>EXAMPLE</i> from the end of the filename.

> pw.envEXAMPLE = pw.env


## 🔧 Running the tests <a name = "tests"></a>

Explain how to run the automated tests for this system.

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

## 🎈 Usage <a name="usage"></a>

Add notes about how to use the system.

## 🚀 Deployment <a name = "deployment"></a>

Add additional notes about how to deploy this on a live system.

## ⛏️ Built Using <a name = "built_using"></a>

- [MongoDB](https://www.mongodb.com/) - Database
- [Express](https://expressjs.com/) - Server Framework
- [VueJs](https://vuejs.org/) - Web Framework
- [NodeJs](https://nodejs.org/en/) - Server Environment

## ✍️ Authors <a name = "authors"></a>

- [@kylelobo](https://github.com/kylelobo) - Idea & Initial work

See also the list of [contributors](https://github.com/kylelobo/The-Documentation-Compendium/contributors) who participated in this project.

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- Hat tip to anyone whose code was used
- Inspiration
- References
