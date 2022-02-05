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
const os = require('os');
const v8 = require('v8');
const _data = require('./data');


// Extend events and instantiate
class _events extends events{};
let e = new _events();
 
// App object or Module scaffolding.
const cli = {} 
// main functions or objects.

// Input handlers
e.on('man', (str)=>{
    cli.responders.help();
})

e.on('help', (str)=>{
    cli.responders.help();
})

e.on('exit', (str)=>{
    cli.responders.exit();
})

e.on('stats', (str)=>{
    cli.responders.stats();
})

e.on('list users', (str)=>{
    cli.responders.listUsers();
})

e.on('more user info',  (str)=>{
    cli.responders.moreUserInfo(str);
})

e.on('list checks', (str)=>{
    cli.responders.listChecks();
})

e.on('more check info', (str)=>{
    cli.responders.moreCheckInfo(str);
})

e.on('list logs', (str)=>{
    cli.responders.listLogs();
})

e.on('more log info', (str)=>{
    cli.responders.moreLogInfo(str);
})

// Responders object
cli.responders = {};

// help/man
cli.responders.help = ()=>{
    let commands = {
        'exit' : 'Kill the CLI (and rest of the application)',
        'man' : 'Show this help page',
        'help' : 'Alias of the man page',
        'stats' : 'Get statistics on the underlying operating system and resource utilization',
        'list users' : 'Show a list of all the registered (undeleted) users in system',
        'more user info --{userId}' : 'Show details of a specific user',
        'list checks --up --down' : 'Show a list of all the active checks in the system, including their state. The "--up" and "--down" flag both are optional ',
        'more check info --{checkId}' : 'Show details of a specific check',
        'list logs' : 'Show a list of all the log files available to be read (compressed and uncompressed)',
        'more log info --{fileName}' : 'Show details of a specific log file'
    }

    // Show a header for the help page that is wide as the screen
    cli.horizontalLine();
    cli.centered('CLI MANUAL');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Show each command, followed by its explanation, in white an yellow respectively.
    for(let key in commands){
        if(commands.hasOwnProperty(key)){
            let value = commands[key];
            let line = '\x1b[33m'+key+'\x1b[0m';
            let padding = 60 - line.length;
            for(i=0; i < padding; i++){
                line+=' ';
            }
            line+=value;
            console.log(line);
            cli.verticalSpace();
        }
    }

    cli.verticalSpace(1);

    // End with another horizontally
    cli.horizontalLine();
}

// Create a vertical space
cli.verticalSpace = (lines)=>{
    lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
    for(i=0; i < lines; i++){
        console.log(' ');
    }
}

// Create a horizontal line across the screen
cli.horizontalLine = ()=>{
    // Get the available screen size
    // Screen size is available in process.stdout.columns
    let width = process.stdout.columns;

    let line = '';
    for(i=0; i < width; i++){
        line+='-';
    }
    console.log(line);
}

// Create centered text on the screen
cli.centered = (str)=>{
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

    // Get the available screen size
    let screenSize = process.stdout.columns;

    // Calculate the left padding there should be
    let leftPadding = Math.floor((screenSize - str.length) / 2);

    // Put the left padding spaces before the string itself
    let line = '';
    for(i = 0; i < leftPadding; i++){
        line+= ' ';
    }
    line+=str;
    console.log(line);
}




// exit
cli.responders.exit = () =>{
    // Calling process.exit() will force the process to exit as quickly as possible even if there are still asynchronous operations pending that have not yet completed fully, including I/O operations to process.stdout and process.stderr.
    process.exit(0);
}

// stats
cli.responders.stats = ()=>{
    // Compile an object of stats
    let stats = {
        'Load Average' : os.loadavg().join(' '),
        'CUP Count' : os.cpus().length,
        'Free Memory' : os.freemem(),
        'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
        'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
        'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
        'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) *100),
        'Uptime' : os.uptime()+' Seconds'
    }

    // Create a header for the stats
    cli.horizontalLine();
    cli.centered('SYSTEM STATISTICS');
    cli.horizontalLine();
    cli.verticalSpace(2);

    // Log out each stat
    for(let key in stats){
        if(stats.hasOwnProperty(key)){
            let value = stats[key];
            let line = '\x1b[31m'+key+'\x1b[0m';
            let padding = 60 - line.length;
            for(i = 0; i < padding; i++){
                line+=' ';
            }
            line+=value;
            console.log(line);
            cli.verticalSpace();
        }
    }
    cli.verticalSpace();

    // End with another horizontal line
    cli.horizontalLine();
}

// list users
cli.responders.listUsers = ()=>{
    _data.list('users', (err, userIds)=>{
        if (!err && userIds && userIds.length > 0) {
           cli.verticalSpace();
           userIds.forEach((userId)=>{
               _data.read('users', userId, (err, userData)=>{
                   if(!err && userData){
                       let line = 'Name: '+userData.firstName+' '+userData.lastName+' Phone: '+userData.phone+' Checks: ';
                       let numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks : 0;
                       line+=numberOfChecks;
                       console.log(line);
                       cli.verticalSpace();
                   }
               })
           })  
          }
    })
}

// more user info
cli.responders.moreUserInfo = (str)=>{
    // Get the id from the string
    let arr = str.split('--');
    let userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
    if(userId){
        // Lookup the user
        _data.read('users', userId, (err, userData)=>{
            if(!err && userData){
                // Remove the hashed password
                delete userData.hashedPassword;

                // Print the JSON with text highlighting
                cli.verticalSpace();
                console.dir(userData, {'colors' : true});
                cli.verticalSpace();
            }
        })
    }
}

// list checks
cli.responders.listChecks =()=>{
    console.log('You asked for list checks');
}

// more check info
cli.responders.moreCheckInfo = ()=>{
    console.log('you asked for more check info');
}

// list logs
cli.responders.listLogs = ()=>{
    console.log('List logs');
}

// more log info
cli.responders.moreLogInfo = ()=>{
    console.log('More log info');
}




// Defining Input Processor function
cli.processInput  = (str)=>{
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
    
    // Only process the input if the user actually wrote something , otherwise ignore it
    if (str) {
        //  Systemize or codify the unique strings that identify the unique questions allowed to be asked.
        let uniqueInputs = [
            'man',
            'help',
            'stats',
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