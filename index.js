 /*
 * Title: Primary or index file for Api
* Description: App's starting file 
* Author: Mohammad Mesbaul Haque
* Github link: https://github.com/mohammad-mesbaul-haque/pirple-nodejs
* Date: 16/12/2021
*/
 
// Dependencies
const http = require('http');
const url = require('url');

// App object or Module scaffolding. 
 
// main functions or objects.


 
 
// Create a server
let server = http.createServer((req, res)=>{
    // Get the url and parse it
    let parsedUrl = url.parse(req.url, true);
    console.log(parsedUrl);
    // Get the path 
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g,'')
    let method = req.method;
    // console.log(method);
    console.log(req);
    // console.log(trimmedPath);
    // send the response
        res.end('Hello World!')

    // Log the response path


})


// Start the server, and have it listen on port 3000
server.listen(3000, ()=>{
    console.log('Server is listening port 3000');
})

 // export the module. 
// module.exports = ; 