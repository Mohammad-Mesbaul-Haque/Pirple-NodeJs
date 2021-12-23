 /*
 * Title: Handlers file for api
* Description: handlers file 
* Author: Mohammad Mesbaul Haque
* Github link: https://github.com/mmesba/pirple-nodejs
* Date: 23/12/2021
*/
 
// Dependencies
 
// App object or Module scaffolding. 
let handlers = {};
 
// main functions or objects.
  // Define handler

// Simple Handler
handlers.ping = (data, callback)=>{
    callback(200, {'name': 'ping'})
}

handlers.notFoundHandler = (data, callback)=>{
    callback(404)
}

 
 
 
 // export the module. 
module.exports = handlers; 