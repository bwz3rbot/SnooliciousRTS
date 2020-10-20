// Checks that command starts with the prefix as defined in the pw.env file
const pre = process.env.COMMAND_PREFIX || "!";
const prefix = function (string) {
    if (string.startsWith(pre)) {
        return true
    }
}
// Takes in text (from on 'message' listener)
// Returns a command/arguments
const buildCMD = function (string) {
    const args = string.slice(pre.length).trim().split(/ +/g);
    const directive = args.shift().toLowerCase();
    const command = {
        directive,
        args
    }
    return command;
}
const command = function (string) {
    if (prefix(string)) {
        return buildCMD(string)
    }
}


module.exports = class Command {
    constructor() {
        this.directive = new String();
        this.args = new Array();
    }

    test(string) {
        console.log("testing string: ", string);
        const cmd = command(string);
        if (cmd) {
            console.log("was a command!", cmd);
            this.directive = cmd.directive;
            this.args = cmd.args;
            return {
                directive: this.directive,
                args: this.args
            };
        } else {
            console.log("was not a command!", cmd);
            return false;
        }

    }
}