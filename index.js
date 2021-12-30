 /*
 * Title: Primary or index file for Api
* Description: App's starting file 
* Author: Mohammad Mesbaul Haque
* Github link: https://github.com/mmesba/pirple-nodejs
* Date: 16/12/2021
*/
 
// Dependencies
let server  = require('./lib/server.js');
// let worker = require('./lib/worker.js');

// Declare the app
let app = {};

// Init function
app.init = ()=>{
    // Start the server
    server.init();
    // Start the worker
    // worker.init();
}

// Execute the function
app.init();

// Export the app
module.exports = app;