/*
 * Title: Frontend Logic For the Application
 * Description: Client side js file for application
 * Author: Mohammad Mesbaul Haque
 * Github link: https://github.com/mmesba
 * Date: 13/02/2022
 */
 
// Dependencies.
 
 
// App object or Module scaffolding.
const app = {} 

// Config
app.config = {
    'sessionTokens' : false
}
// main functions or objects.
//  AJAX Client   (for the restful api)
app.client = {};

// Interface for making API calls
app.client.request = (headers, path, method, queryStringObject, payload, callback)=>{
    // Set defaults
    headers = typeof(headers) === 'object' && headers !==null ? headers : {};
    path = typeof(path) === 'string' ? path : '/';
    method = typeof(method) === 'string' && ['POST', 'GET', 'PUT', 'DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) === 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) === 'object' && payload !== null ? payload : {};
    callback = typeof(callback) === 'function' ? callback : false;

    // For each query string parameter sent, add it to the path
    let request = path+'?';
    let counter = 0;
    
}
 
 
// export the module.
//  module.exports = app