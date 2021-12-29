 /*
 * Title: helpers file.
* Description: Helpers file  
* Author: Mohammad Mesbaul Haque
* Github link: https://github.com/mmesba/pirple-nodejs
* Date: 24/12/2021
*/
 
// Dependencies
 const crypto = require('crypto');
const config = require('../config');
const queryString = require('querystring')
const https = require('https');
// App object or Module scaffolding. 
let helpers = {}; 
// main functions or objects.
  helpers.hash = (str)=>{
      if(typeof(str) === 'string' && str.length > 0 ){
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
      }else{
          return false;
      }
  }
 
//  Parse a json string to an object in all cases , without throwing
helpers.parseJsonToObject = (str)=>{
    try {
        let obj = JSON.parse(str)
        return obj;
    } catch (e) {
        return {};
    }
}


// Create a string of random alphanumeric character, of a given length
helpers.createRandomString = (strLength) =>{
    strLength = typeof(strLength) === 'number' && strLength > 0 ? strLength : false;

    if (strLength) {
        // Define all the possible character that could go into a string;
        let possibleCharacter = 'abcdefghijklmnopqrstuvwxyz0123456789';
        
        // Start the final staring
        let str = '';

        for(i=1; i <= strLength; i++){
            // Get the random character from the possible character
            let randomCharacter = possibleCharacter.charAt(Math.floor(Math.random() * possibleCharacter.length));

            // Append this character to the final staring
            str += randomCharacter;
        }

        // return the final string
        return str;
        
      } else {
         return false;
     }
}
 


// Send a message via Twilio
helpers.sendTwilioSms = (phone, msg, callback)=>{
    // Validate parameters
    phone = typeof(phone) === 'string' && phone.trim().length === 11 ?  phone.trim() : false;
    msg = typeof(msg) === 'string' && msg.trim().length > 0 && msg.trim().length <= 1600 ? msg.trim() : false;

    if (phone && msg) {
        // Configure the request payload
        let payload = {
            'From':  config.twilio.fromPhone,
            'To': phone,
            'Body': msg
        } 

        // Configure the request payload.
        let stringPayload = queryString.stringify(payload);

        // Configure the request details
        let requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'path': `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
            'auth': config.twilio.accountSid+':'+config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        };
        // Instantiate the request object
        let req = https.request(requestDetails, (res)=>{
            // Grab the status of the sent request.
            let status = res.statusCode;
            // Callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false); 
              } else {
                 callback('Status code returned was '+status)
             }
        });

        // Bind to the error event so it doesn't get thrown
        req.on('error', (e)=>{
            callback(e);
        })

        // add the payload
        req.write(stringPayload);

        // End the request
        req.end();

      } else {
         callback('Given params are missing or invalid')
     }
}



// export the module. 
module.exports = helpers; 