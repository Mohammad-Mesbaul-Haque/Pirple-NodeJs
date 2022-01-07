/*
 * Title: Server File
 * Description: Server File for API
 * Author: Mohammad Mesbaul Haque
 * Github link: https://github.com/mmesba
 * Date: 30/12/2021
 */
 
// Dependencies.
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const {StringDecoder } = require('string_decoder');
const config = require('../config'); 
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');   
const util = require('util');
let debug = util.debug('server')

// App object or Module scaffolding. 
//  Instantiate the server module object
let server = {};

// main functions or objects.

// Instantiate the http server
server.httpServer = http.createServer((req, res)=>{
   server.unifiedServer(req, res)  
})


// instantiate the HTTPS server
server.httpsServerOptions = {
    'key' : fs.readFileSync(path.join(__dirname, '../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname, '../https/cert.pem'))
}

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res)=>{
    server.unifiedServer(req, res)
})



// All the server logics for both the http and https server
server.unifiedServer = (req, res)=>{
    // Get the url and parse it
    let parsedUrl = url.parse(req.url, true);
    // Get the path 
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'')
    let method = req.method.toLowerCase();
    let queryStringObject = parsedUrl.query
    let headers = req.headers;

    // Get the payload
    let decoder = new StringDecoder('utf-8');
    let buffer = ''; 
    req.on('data', (data)=>{
        buffer += decoder.write(data)
    })
    req.on('end', ()=>{
        buffer += decoder.end();

        // Choose the handler this request should go to . If one is not found use the not found handler
        let chosenHandler  = typeof(server.router[trimmedPath])  !== 'undefined' ? server.router[trimmedPath] : handlers.notFoundHandler;

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method': method,
            'headers' : headers,
            'payload': helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        // Chosen handler now holds the value of a function which will be called as users request.
        chosenHandler(data, (statusCode, payload, contentType)=>{

            // Determine the type of response (fallback to JSON)
            contentType = typeof(contentType) === 'string' ? contentType : 'json';

            // Use the status code called back by the handler , or default 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            
            // Return the response parts that are content-specific
            let payloadString = '';
            if (contentType == 'json') {
                res.setHeader('Content-Type', 'application/json');
                // Use the payload called back by the handler , or default to an empty object.
                payload = typeof(payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
                
            }
            if(contentType == 'html'){
                res.setHeader('Content-Type', 'text/html');
                payloadString = typeof(payloadString) == 'string' ? payload : '';

            }

            // Return the response-parts that are common to all content-types
            res.writeHead(statusCode);
            res.end(payloadString);

            // Print conditionally
            if (statusCode === 200) {
                console.log('\x1b[32m%s\x1b[0m', method.toUpperCase()+'/'+trimmedPath+'  '+statusCode);
              } else {
                console.log('\x1b[31m%s\x1b[0m', method.toUpperCase()+'/'+trimmedPath+'  '+statusCode);
             }
        })
})
}


// Define a request router
server.router = {
    '' : handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'checks/all' : handlers.checkList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    'ping': handlers.ping,
    'api/users': handlers.users,
    'api/tokens' : handlers.tokens,
    'api/checks' : handlers.checks
}


// Init function
server.init = ()=>{
// Start the http server, and have it listen on port
server.httpServer.listen(config.httpPort, ()=>{
    console.log('\x1b[33m%s\x1b[0m', `Server is listening port ${config.httpPort}`  );
})

// Start the HTTPS server
server.httpsServer.listen(config.httpsPort, ()=>{
    console.log('\x1b[33m%s\x1b[0m', `Server is listening port  ${config.httpsPort}`);
})
}
 // export the module. 
module.exports = server;