const captureDirective =
    (str) => {
        return str.slice(0, 1)[0].slice(1);
    }

/* Build Args */
const buildArgs =
    (args) => {
        console.log('BUILDING ARGUMENTS!');
        const argarray = [];
        args.forEach(arg => {
            let a = arg;
            if (arg.includes(":")) {
                const a = arg.split(':');
                argarray.push([a[0], a[1]]);
            } else {
                argarray.push([a]);
            }
        });
        return argarray;
    }


class Command {
    constructor(prefix) {
        this.prefix =
            process.env.COMMAND_PREFIX ||
            prefix ||
            "!";
    }
    handle(string) {
        console.log(string);
        string = string.trim();
        const pref = string[0];
        if (pref != this.prefix) {
            return;
        }

        const str = string.split(/ /g);

        if (str.length === 1) { // If no args, return command
            return {
                // directive: str.slice(0, 1)[0].slice(1),
                directive: captureDirective(str),
                args: []
            }
        }

        const directive = captureDirective(str);

        const a = str.slice(1, str.length);

        const args = buildArgs(a);

        return {
            directive,
            args
        }
    }
    stripULINK(string) {
        console.log('WAS UMENTION STRIPPING LINK');
        string.startsWith('u/' + process.env.REDDIT_USER) ?
            string = string.replace('u/' + process.env.REDDIT_USER, '') : false;
        string.startsWith('/u/' + process.env.REDDIT_USER) ?
            string = string.replace('/u/' + process.env.REDDIT_USER, '') : false;
        return string;
    }

}

module.exports = new Command();