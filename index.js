 /*
 * Title: Primary or index file for Api
* Description: App's starting file 
* Author: Mohammad Mesbaul Haque
* Github link: https://github.com/mmesbaul/pirple-nodejs
* Date: 16/12/2021
*/
 
// Dependencies
const http = require('http');
const url = require('url');
const {StringDecoder } = require('string_decoder');

// App object or Module scaffolding. 
 
// main functions or objects.


 
 
// Create a server
let server = http.createServer((req, res)=>{
    // Get the url and parse it
    let parsedUrl = url.parse(req.url, true);
    // console.log(parsedUrl);
    // Get the path 
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'')
    let method = req.method;

    // Get the payload
    let decoder = new StringDecoder('utf-8');
    let buffer = ''; 
    req.on('data', (data)=>{
        buffer += decoder.write(data)
    })
    req.on('end', ()=>{
        buffer += decoder.end();
        // Send the response
        res.end("Hello World!");
        console.log(buffer);
    })

})


// Start the server, and have it listen on port 3000
server.listen(3000, ()=>{
    console.log('Server is listening port 3000');
})

 // export the module. 
// module.exports = ; 