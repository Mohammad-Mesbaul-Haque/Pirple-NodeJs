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
const config = require('../config');
// App object or Module scaffolding. 
let handlers = {};


/*
 HTML Handlers
*/
// Index handler
handlers.index = (data, callback)=>{
  // Reject any request that is not a Get
  if(data.method == 'get') {

    // Prepare data for interpolation
    let templateData = {
      'head.title' : 'This is the title',
      'head.description' : 'This is the meta description',
      'body.title' : 'Hello templated world',
      'body.class'  : 'index'
    }

    // Read  in a template as a string
    helpers.getTemplate('index', templateData, (err, str)=>{
      if (!err && str) {
        // Add the universal header and footer 
        helpers.addUniversalTemplates(str, templateData, (err, str)=>{
          if (!err && str) {
              // Return that page as HTML
              callback(200, str, 'html') 
            } else {
              callback(500, undefined , 'html')
           }
        })

      } else {
           callback(500, undefined, 'html')
       }
    })
  } else {
    callback(405, undefined, 'html')
  }

}



/*
JSON API Handlers
*/
 
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

    // Get the token from headers
    let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
    
    // Verify that the given token is valid for the phone number;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid)=>{
      if (tokenIsValid) {
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
           callback(403, {'Error': 'Token is missing or invalid'})
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



            // Get the token from headers
    let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
    
    // Verify that the given token is valid for the phone number;
    handlers._tokens.verifyToken(token, phone, (tokenIsValid)=>{
      if (tokenIsValid) {


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


        } else {
           callback(403, {'Error': 'Token is missing or invalid'})
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

        // Get the token from headers
        let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
    
        // Verify that the given token is valid for the phone number;
        handlers._tokens.verifyToken(token, phone, (tokenIsValid)=>{
          if (tokenIsValid) {
      
      // Lookup the user
      _data.read('users', phone, (err, userData)=>{
        if (!err && data) {
            _data.delete('users', phone, (err)=>{
              if (!err) {
                // Delete each of the checks associated with the user
                let userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                let checksToDelete = userChecks.length;

                if (checksToDelete > 0) {
                     let checksDeleted = 0;
                     let deletionErrors  = false;
                    //  Loop through the checks
                    userChecks.forEach((checkId) => {
                      // Delete the check
                      _data.delete('checks', checkId, (err)=>{
                        if (err) {
                            deletionErrors = true; 
                          } 
                        checksDeleted++;
                        if (checksDeleted === checksToDelete) {
                          if (!deletionErrors) {
                            callback(200, {"msg": "user deleted with all associate checks for this user!"}) 
                          }
                        }
                      })
                    });
                  } else {
                    callback(200, {"msg": "user deleted with no checks needed to be delete"}) 
                 }                          
                } else {
                   callback(500, {"error": "Could not delete the specified user"})
               }
            }) 
          } else {
             callback(400, {'Error': 'Could not find specified user'})
         }
      }) 


          } else {
            callback(403, {'Error': 'Token is missing or invalid'})
        }
     })
            

    } else {
       callback(400, "Missing required field")
   }
}


// Tokens
handlers.tokens = (data, callback)=>{
  let acceptedMethods = [ 'get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(data.method) > -1) {
        handlers._tokens[data.method](data, callback);
    } else {
       callback(405);
   }
}

// Container for all token methods
handlers._tokens = {};

// Token post
handlers._tokens.post = (data, callback)=>{
  let phone = typeof(data.payload.phone) === 'string' && data.payload.phone.trim().length === 11  ? data.payload.phone.trim() : false;

  let password = typeof(data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  if (phone && password) {
      // Lookup the user who matches that phone number
      _data.read('users', phone, (err, userData)=>{
         if (!err && userData) {
            // Hash the user password and compare it with db's password
            let hashedPassword = helpers.hash(password);
            if (hashedPassword === userData.hashedPassword) {
                // If valid , create a token with a random name and set 1 hour expiration date.
                let tokenId = helpers.createRandomString(20);
                let expires = Date.now() + 1000 * 60 * 60;
                let tokenObject = {
                  'phone' : phone,
                  'id' : tokenId,
                  'expires': expires
                } 

                // Store the token
                _data.create('tokens', tokenId, tokenObject, (err)=>{
                  if (!err) {
                      callback(200, tokenObject); 
                    } else {
                       callback(500, {'Error' : 'Could not create the new token'})
                   }
                })
              } else {
                 callback(400, {'Error': 'Password did not match!'})
             } 
           } else {
              callback(400, {'Error': 'Could not find the specific user'})
          }
      }) 
    } else {
       callback(400, {'Error' : 'Missing required field (s)'})
   }
}

// Token get
handlers._tokens.get = (data, callback)=>{
  // Check that the id is valid
  let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
  
  if (id) {
      // Lookup the user
      _data.read('tokens', id, (err, tokenData)=>{
        if (!err && tokenData) {
            callback(200, tokenData); 
          } else {
             callback(404)
         }
      }) 
    } else {
       callback(400, {'Error': 'Missing required field!'})
   }
}

// Token put
// Tokens - put
// Required Data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback)=>{
  let id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id : false;

  let extend = typeof(data.payload.extend) === 'boolean' && data.payload.extend === true ? true : false;

  if (id && extend) {
      //  Lookup the token
      _data.read('tokens', id, (err, tokenData)=>{
        if (!err && tokenData) {
            // Check to make sure that the token is not already expired.
            if (tokenData.expires > Date.now()) {
                // Set the expiration an hour from now
                tokenData.expires = Date.now() + 1000 * 60 * 60 ;

                // Store the new updates
                _data.update('tokens', id, tokenData, (err)=>{
                  if (!err ) {
                      callback(200, {'msg': 'Token updated!!'}) 
                    } else {
                       callback(500)
                   }
                })

              } else {
                  callback(400, {'error':'The token has already expired'})
             } 
          } else {
             callback(400, {'Error': 'Specified token does not exist!'})
         }
      })
    } else {
       callback(400, {'Error': 'Missing required field or invalid'})
   }

}

// Token delete
// Required data : id
handlers._tokens.delete =(data, callback)=>{
  let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
      // Lookup the user
      _data.read('tokens', id, (err, tokenData)=>{
        if (!err && tokenData) {
            _data.delete('tokens', id, (err)=>{
              if (!err) {
                  callback(200); 
                } else {
                   callback(500, {'error': 'Could not delete specified user'})
               }
            }) 
          } else {
             callback(400, {'error': 'Could not find specified user'})
         }
      }) 
    } else {
       callback(400, {'error': 'missing required field'})
   }
}

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = (id, phone, callback)=>{
  // Lookup the token
  _data.read('tokens', id, (err, tokenData)=>{
    if (!err && tokenData) {
        // Check the token belongs to same phone user's
        if (tokenData.phone === phone && tokenData.expires > Date.now()) {
            callback(true); 
          } else {
             callback(false)
         } 
      } else {
         callback(false)
     }
  })
}



// Checks Handlers and functionalities
handlers.checks = (data, callback)=>{
  let acceptedMethods = ['post', 'get', 'put', 'delete'];
  if (acceptedMethods.indexOf(data.method) > -1) {
       handlers._checks[data.method](data, callback);
    } else {
       callback(405)
   }
}

// Container for all the checks methods
handlers._checks = {}

// Checks - post
// Required data : protocol, url, method, successCodes, timeoutSeconds
handlers._checks.post = (data, callback)=>{
  // validate all the inputs
  let protocol = typeof(data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;

  let url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;

  let method = typeof(data.payload.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;

  let successCodes = typeof(data.payload.successCodes) === 'object' &&  data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
// Check give timeoutSeconds are hole number
  let timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
      //  Get the token from headers and verify it
      let token = typeof(data.headers.token) === 'string'  ? data.headers.token : false;

      // Lookup the user by reading token
      _data.read('tokens', token, (err, tokenData)=>{
        if (!err && tokenData) {
             let userPhone = tokenData.phone;
             
            //  Lookup the user
            _data.read('users', userPhone, (err, userData)=>{
              if (!err && userData) {
                  let userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
                  
                  // verify that the user has  less than the   number of max-checks-per-user
                  if (userChecks.length < config.maxChecks ) {
                        // Create a random id for the check
                        let checkId = helpers.createRandomString(20);
                        
                        // Create the check object and include the user's phone
                        let checkObject = {
                          'id': checkId,
                          'userPhone': userPhone,
                          'protocol' : protocol,
                          'url' : url,
                          'method' : method,
                          'successCodes' : successCodes,
                          'timeoutSeconds': timeoutSeconds
                        };
                        // save the object
                        _data.create('checks', checkId, checkObject, (err)=>{
                          if (!err) {
                              // Add the check id to the user's object
                              userData.checks = userChecks;
                              userData.checks.push(checkId);
                              
                              // Save the new user data
                              _data.update('users', userPhone, userData, (err)=>{
                                if (!err) {
                                    // REturn the data about the new checks
                                    callback(200, checkObject) 
                                  } else {
                                     callback(500, {'error': 'could not update the user'})
                                 }
                              })
                            } else {
                               callback(500, {'error' : 'Could not create new checks'})
                           }
                        })

                    } else {
                       callback(400, {'error': 'The user already has the maximum number of checks'})
                   }
                } else {
                   callback(403)
               }
            })
          } else {
             callback(403, {'error': 'unauthorized'})
         }
      })
    } else {
      callback(400, {'error': 'Missing required inputs  or inputs are invalid '}) 
   }
}

// Checks - get
handlers._checks.get = (data, callback) =>{
  let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id : false;

  if (id) {
      //  Lookup the check
      _data.read('checks', id, (err, checkData)=>{
        if (!err && checkData) {
            // Get the token from headers
            let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
            // Verify that the given token is valid and belongs to the user who created it
            handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid)=>{
              if (tokenIsValid) {
                  // Return the check data
                  callback(200, checkData); 
                } else {
                   callback(403, {'error': 'Missing required token in header or token is invalid'})
               }
            }) 
          } else {
             callback(404)
         }
      })
    } else {
       callback(400, {'error':'Missing required field!'})
   }
}

// Checks - put
handlers._checks.put = (data, callback)=>{
  // Check for the required field
  let id = typeof(data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;

  // Check for the optional fields
  let protocol = typeof(data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
  let url = typeof(data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  let method = typeof(data.payload.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
  let successCodes = typeof(data.payload.successCodes) === 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes.length : false;
  let timeoutSeconds = typeof(data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds %1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
  
  // Make sure id is valid
  if (id) {
      //  Check to make sure one or more optional fields has been sent
      if (protocol || url || method || successCodes || timeoutSeconds) {
          // Lookup the check
          _data.read('checks', id, (err, checkData)=>{
            if (!err && checkData) {
                // Get the token from  the headers
                let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
                // Verify the given token is valid and belongs to the user who created 
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid)=>{
                  if (tokenIsValid) {
                      // Update the check where it necessary
                      if (protocol) {
                        checkData.protocol = protocol;  
                      } 
                      if (url) {
                        checkData.url = url
                      }
                      if (method) {
                        checkData.method = method
                      }
                      if (successCodes) {
                        checkData.successCodes = successCodes
                      }
                      if (timeoutSeconds) {
                        checkData.timeoutSeconds = timeoutSeconds
                      }

                      // Store the new updates
                      _data.update('checks', id, checkData, (err)=>{
                        if (!err) {
                             callback(200, {'msg': 'updated!'});
                          } else {
                             callback(500, {'error': 'could not update (internal)'})
                         }
                      })


                    } else {
                       callback(403)
                   }
                }) 
              } else {
                 callback(400, {'error': 'check id did not exist!'})
             }
          }) 
        } else {
          callback(400, {'error': 'missing fields to update!'})
       }
    } else {
       callback(400,  {'error': 'Missing required field'})
   }
}

// Checks - delete
// This delete method is different because not only it deletes check object also remove instance from user checks array
handlers._checks.delete = (data, callback) =>{
  // Check the id is valid
  let id = typeof(data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
      //  Lookup the checks
      _data.read('checks', id, (err, checkData)=>{
        if (!err && checkData) {
            //  Get the token from the headers
            let token = typeof(data.headers.token) === 'string' ? data.headers.token : false;
            handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid)=>{
              if (tokenIsValid) {
                  // Delete the check data
                  _data.delete('checks', id, (err)=>{
                    if (!err) {
                        // Lookup the user
                        _data.read('users', checkData.userPhone, (err, userData)=>{
                          if (!err && userData) {
                              let userChecks = typeof(userData.checks) === 'object' && userData.checks instanceof  Array  ?  userData.checks : [];

                              // Remove the deleted check id from user checks
                              let checkPosition = userChecks.indexOf(id);
                              if (checkPosition > -1) {
                                   userChecks.splice(checkPosition, 1);
                                    // Update the user data
                                    userData.checks = userChecks;
                                    _data.update('users', userData.phone, userData, (err)=>{
                                      if (!err) {
                                          callback(200, {'msg':'deleted!'}); 
                                        } else {
                                           callback(500, {'error': 'server error'})
                                       }
                                    }) 
                                } else {
                                   callback(400, {'error': 'Check id you are trying to remove is not found in user!'})
                               }
                            } else {
                               callback(400, {'error': 'Could not find the specific user'})
                           }
                        }) 
                      } else {
                         callback(500, {'error': 'Internal server error'})
                     }
                  }) 
                } else {
                   callback(403)
               }
            })
          } else {
             callback(400, {'error': 'Specified check id does not exist'})
         }
      })
    } else {
      callback(400, {'error': 'missing required field'})
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