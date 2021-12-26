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
 
//  console.log(helpers.hash('kdsfj'));
 // export the module. 
module.exports = helpers; 