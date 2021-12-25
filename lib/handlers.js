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

// Users GET endpoint
// Required data - phone
handlers._users.get = (data, callback)=>{
  // Check the phone number is valid
  let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 11 ? data.queryStringObject.phone.trim() : false;

  if (phone) {
      // Lookup the user
      _data.read('users', phone, (err, data)=>{
        if (!err && data) {
            // Remove the hashed password from the user object before return it to the user.
             delete data.hashedPassword;
             callback(200, data) 
          } else {
             callback(404)
         }
      }) 
    } else {
       callback(400, {"error": "Missing required field!"})
   }

}

// Users -put
handlers._users.put = (data, callback)=>{
  // Check for the required field is valid
  let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length  === 11 ? data.payload.phone : false;

  // Check for the optional field
   let firstName = typeof(data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

   let lastName = typeof(data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

   let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0  ? data.payload.password : false;

  //  Error is the phone is invalid
  if (phone) {
      // Error if nothing is sent to update
      if (firstName || lastName || password) {
        // Lookup user
        _data.read('users', phone, (err, userData)=>{
          if (!err && userData) {
              // Update the fields necessary
              if (firstName) {
                userData.firstName = firstName
              } 
              if (lastName) {
                userData.lastName = lastName
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }
              // Store the new updates
              _data.update('users', phone, userData, (err)=>{
                if (!err) {
                    callback(200, {'message': 'updated!'}) 
                  } else {
                     console.log(500, {'Error': 'Could not update the user!'})
                 }
              })

            } else {
               callback(400, {'error': 'The specified user does not exist!'})
           }
        })
      } else{
        callback(400, {'Error': 'Missing fields to update!'})
      }
    } else {
       callback(400, {"Error": "Missing required field!"})
   }
}

// Users -delete
handlers._users.delete = (data, callback)=>{
  // Check that the phone number is valid
  let phone = typeof(data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 11 ? data.queryStringObject.phone.trim() : false;
  if (phone) {
      // Lookup the user
      _data.read('users', phone, (err, data)=>{
        if (!err && data) {
            _data.delete('users', phone, (err)=>{
              if (!err) {
                  callback(200, {"msg": "user deleted!"}) 
                } else {
                   callback(500, {"error": "Could not delete the specified user"})
               }
            }) 
          } else {
             callback(400, {'Error': 'Could not find specified user'})
         }
      }) 
    } else {
       callback(400, "Missing required field")
   }
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