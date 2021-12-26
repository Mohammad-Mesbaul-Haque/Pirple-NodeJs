 /*
 * Title: Primary or index file for Api
* Description: App's starting file 
* Author: Mohammad Mesbaul Haque
* Github link: https://github.com/mmesba/pirple-nodejs
* Date: 16/12/2021
*/
 
// Dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const {StringDecoder } = require('string_decoder');
const config = require('./config'); 
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');

// App object or Module scaffolding. 
 
// main functions or objects.

// Instantiate the http server
let httpServer = http.createServer((req, res)=>{
    unifiedServer(req, res)  
})

// Start the http server, and have it listen on port
httpServer.listen(config.httpPort, ()=>{
    console.log(`Server is listening port ${config.httpPort}`  );
})

// instantiate the HTTPS server
let httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pem')
}

let httpsServer = https.createServer(httpsServerOptions, (req, res)=>{
    unifiedServer(req, res)
})

// Start the HTTPS server
httpsServer.listen(config.httpsPort, ()=>{
    console.log(`Server is listening port ${config.httpsPort}`);
})

// All the server logics for both the http and https server
let unifiedServer = (req, res)=>{
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
        let chosenHandler  = typeof(router[trimmedPath])  !== 'undefined' ? router[trimmedPath] : handlers.notFoundHandler;

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
        chosenHandler(data, (statusCode, payload)=>{
            // Use the status code called back by the handler , or default 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            // Use the payload called back by the handler , or default to an empty object.
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to an empty string
            let payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log(`Returning this response ${statusCode} ${payloadString} `);
        })
})
}


// Define a request router
var router = {
    'ping': handlers.ping,
    'users': handlers.users,
    'tokens' : handlers.tokens
}


 // export the module. 
// module.exports = ; 