console.log("Requiring dotenv");
const dotenv = require('dotenv').config({
    path: "pw.env"
});
console.log("Requiring Reddit.");
const Reddit = require('./lib/Reddit');
console.log("Creating new Reddit Class.");
const reddit = new Reddit();
const Command = require('./util/Command');


(async () => {
    let command = new Command().test('$is this a command?');

    if(command){
        console.log("yes!", command);
    } else {
        console.log("NO!", command);
    }

})();