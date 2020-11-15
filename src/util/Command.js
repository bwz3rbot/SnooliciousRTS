/* Extract Directive */

/* Build Args */
const buildArgs = function (args) {
    const argarray = [];
    args.forEach(arg => {
        if (arg.includes(":")) {
            const a = arg.split(':');

            argarray.push([a[0], a[1]]);
        }
    });
    return argarray;
}
module.exports = class Command {
    constructor(prefix) {
        this.prefix = prefix;
    }
    /* 
            [Test]
                - Tests a string for first char = prefix
                - Returns a built command with array of args
                - Or false if no prefix is found

        */
    handle(string) {
        string = string.trim();
        const pref = string[0];
        if (pref != this.prefix) {
            return false;
        }
        const str = string.split(' ');
        if (str.length === 1) { // If no args, return command
            return {
                directive: str.slice(0,1)[0].slice(1),
                args: []
            }
        }

        const directive = str.slice(0, 1)[0].slice(1);
        const a = str.slice(1, str.length);
        const args = buildArgs(a);
        return {
            directive,
            args
        }
    }

    stripULINK(string) {
        if (string.startsWith('u/'+process.env.REDDIT_USER)) {
            string = string.replace('u/'+process.env.REDDIT_USER, '');
        } else if (string.startsWith('/u/'+process.env.REDDIT_USER)) {
            string = string.replace('/u/'+process.env.REDDIT_USER, '');
        }
        return string;
    }
}