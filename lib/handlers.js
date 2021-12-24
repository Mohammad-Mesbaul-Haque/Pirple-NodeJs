 /*
 * Title: Handlers file for api
* Description: handlers file 
* Author: Mohammad Mesbaul Haque
* Github link: https://github.com/mmesba/pirple-nodejs
* Date: 23/12/2021
*/
 
// Dependencies
 const _data = require('../lib/data');
const helpers = require('../lib/helpers');
// App object or Module scaffolding. 
let handlers = {};
 
// main functions or objects.
  // Define handler
// Users handler
handlers.users = (data, callback)=>{
  let acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else{
    callback(405)
  }
}

// Container for the users sub methods
handlers._users = {};

// Users -post
// Required data: firstName, lastName, phone, password, tosAgreement
handlers._users.post = (data, callback)=>{
  // Required fields filled out checking
 const firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;

    const lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName  : false;

    const phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 11 ? data.payload.phone : false;

    const password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;

    const tosAgreement = typeof(data.payload.tosAgreement) === 'boolean' ? data.payload.tosAgreement : false;

  if (firstName && lastName && phone && password && tosAgreement ) {
    // Make sure that the user doesn't already exist
    _data.read('users', phone, (err, data)=>{
      if (err) {
        // Hash the password
        let hashedPassword = helpers.hash(password);

if (hashedPassword) {
            // Create the user object
            let userObject = {
              'firstName': firstName,
              'lastName': lastName,
              'phone' : phone,
              'hashedPassword' : hashedPassword,
              'tosAgreement' : true
            }
    
            // Store the user to db
            _data.create('users', phone, userObject, (err)=>{
              if (!err) {
                  callback(200);
                } else {
                   console.log(err);
                   callback(500, {'Error': 'Could not create the new user!'});
               }
            }) 
  } else {
     callback(500, {'Error': 'Could not create new user!'})
 }

      } else {
        // User already exist
        callback(400, {'error' : 'An user with  that phone number already exist'})
      }
    })
  }else{
    callback(400, {'error' : 'Missing required field'})
  }
}

// Users get
handlers._users.get = (data, callback)=>{
  callback(200)
}

// Users -put
handlers._users.put = (data, callback)=>{

}

// Users -delete
handlers._users.delete = (data, callback)=>{

}

// Simple Handler
handlers.ping = (data, callback)=>{
  console.log(data.method);
    callback(200, {'name': 'ping'})
}

handlers.notFoundHandler = (data, callback)=>{
    callback(404)
}

 
 
 
 // export the module. 
module.exports = handlers; 