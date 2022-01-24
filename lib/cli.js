/*
 * Title: CLI-Related file
 * Description: Cli file to interact with app via cli
 * Author: Mohammad Mesbaul Haque
 * Github link: https://github.com/mmesba
 * Date: 25/01/2022
 */
 
// Dependencies.
 const readline = require('readline');
const util = require('util');
let debug = util.debuglog('cli');
const events = require('events');
// Extend events and instantiate
class _events extends events{};
let e = new _events();
 
// App object or Module scaffolding.
const cli = {} 
// main functions or objects.
// Defining Input Processor function
cli.processInput  = (str)=>{
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

    // Only process the input if the user actually wrote something , otherwise ignore it
    if (str) {
        //  Systemize or codify the unique strings that identify the unique questions allowed to be asked.
        let uniqueInputs = [
            'man',
            'help',
            'exit',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        // Go through the possible inputs, emit an event when a match is found.
        let matchFound = false;
        let counter = 0;
        uniqueInputs.some((input)=>{
            if(str.toLowerCase().indexOf(input) > -1){
                matchFound = true;
                // Emit an event matching the unique input, and include the full string given
                e.emit(input, str);
                return true;
            }
        })

        // If no match is found, tell the user to try again
        if(!matchFound) {
            console.log('Sorry, try again');
        }
      }
}


// init script
 cli.init = ()=>{
     console.log('\x1b[33m%s\x1b[0m','cli started');

    //  Start the interface
    let _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    })

    // Create an initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line',(str)=>{
        // Send to the input processor
        cli.processInput(str);

        // Reinitialize the prompt afterwards
        _interface.prompt();
    });

    // If the user stops the CLI, kill the associated process
    _interface.on('close',()=>{
        // Calling process.exit() will force the process to exit as quickly as possible even if there are still asynchronous operations pending that have not yet completed fully, including I/O operations to process.stdout and process.stderr.
        process.exit(0);
    })

 }
 
 
 
// export the module.
 module.exports= cli;