console.log("Requiring dotenv");
const dotenv = require('dotenv').config({
    path: "pw.env"
});
console.log("Requiring Reddit.");
const Snoolicious = require('./lib/Snoolicious');
console.log("Creating new Reddit Class.");
const snoolicious = new Snoolicious();
const Command = require('./util/Command');


(async () => {
    let command = new Command().test('$is this a command?');

    if(command){
        console.log("yes!", command);
    } else {
        console.log("NO!", command);
    }

})();