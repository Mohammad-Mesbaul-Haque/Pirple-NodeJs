/*
 * Title: Worker File
 * Description: Worker File for API
 * Author: Mohammad Mesbaul Haque
 * Github link: https://github.com/mmesba
 * Date: 30/12/2021
 */
 
// Dependencies.
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
let _data = require('./data');
let helpers = require('./helpers');
const url = require('url'); 
let _logs = require('./logs');
// App object or Module scaffolding.
 const workers = {}
// main functions or objects.
 
// Lookup all the checks, get their data and send to a validator
workers.gatherAllChecks = ()=>{
    // Get all the checks that existed in the system
    _data.list('checks', (err, checks)=>{
        if (!err && checks && checks.length > 0) {
             checks.forEach(check => {
                //  Read in the check data 
                _data.read('checks', check, (err, originalCheckData)=>{
                    if (!err && originalCheckData) {
                        // Pass the data to check validator and let that function continue or log errors as needed
                        workers.validateCheckData(originalCheckData); 
                      } else {
                         console.log('Error reading one of the check data')
                     }
                })
             });
          } else {
             console.log('Could not found any check to process');
         }
    })
}

// Sanity-check the check data
workers.validateCheckData = (originalCheckData)=>{
    originalCheckData = typeof(originalCheckData) === 'object' && originalCheckData !== null ? originalCheckData : {};

    originalCheckData.id = typeof(originalCheckData.id) === 'string' &&  originalCheckData.id.trim().length === 20 ? originalCheckData.id.trim() : false;

    originalCheckData.userPhone = typeof(originalCheckData.userPhone) === 'string' && originalCheckData.userPhone.trim().length === 11 ? originalCheckData.userPhone.trim() : false;
     
    originalCheckData.protocol = typeof(originalCheckData.protocol) === 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;

    originalCheckData.url = typeof(originalCheckData.url) === 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;

    originalCheckData.method = typeof (originalCheckData.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;

    originalCheckData.successCodes = typeof(originalCheckData.successCodes) === 'object' && originalCheckData.successCodes instanceof Array  && originalCheckData.successCodes.length > -1 ? originalCheckData.successCodes : false;

   originalCheckData.timeoutSeconds = typeof(originalCheckData.timeoutSeconds) === 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds :false;

    // Set the keys that may not be set (If the workers have never seen this check before)
    originalCheckData.state = typeof(originalCheckData.state) === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';

    originalCheckData.lastChecked = typeof(originalCheckData.lastChecked) === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;
    
    // If all the checks pass, pass the data along to the next step in process
    if(originalCheckData.id && originalCheckData.userPhone && originalCheckData.protocol && originalCheckData.url && originalCheckData.method && originalCheckData.successCodes && originalCheckData.timeoutSeconds){
            workers.performCheck(originalCheckData);
        }else{
            console.log('error: One of the checks is not formatted properly. Skipping it');
        }
}



// Perform the check, send the original check data , and the outcome of the check process to the next step  in the process.
workers.performCheck = (originalCheckData) =>{
    // PRepare the initial check outcome
    let checkOutCome = {    
        'error': false,
        'responseCode': false
    }

    // Mark that the outcome  has not been sent yet
    let outComeSent = false;

    // Parse the hostname and path out of the original check data
    let parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true);
    let hostname = parsedUrl.hostname;
    // We use path here not path name because we want full url with query staring 
    let path = parsedUrl.path; 
    
    // construct the request
    let requestDetails = {
        'protocol': originalCheckData.protocol+':',
        'hostname': hostname,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    };

    // Instantiate the request object (using either http or https module)
    let _moduleToUse = originalCheckData.protocol === 'http' ? http : https;
    let req =   _moduleToUse.request(requestDetails, (res)=>{
        // Grab the status of the sent request
        let status = res.statusCode;

        // Update the check outcome and pass the data along
        checkOutCome.responseCode = status;
        if (!outComeSent) {
           workers.processCheckOutcome(originalCheckData, checkOutCome);  
           outComeSent = true;
          }
    });

    // Bind to the error event so it does not get thrown
    req.on('error', (e)=>{
        // Update the check outcome and Pass the data along
        checkOutCome.error = {
            'error': true,
            'value': e
        };
        if (!outComeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    // Bind to the timeout event
    req.on('timeout', (e)=>{
        // Update the check outcome and pass the data along
        checkOutCome.error = {
            'error': true,
            'value': 'timeout'
        }
        if (!outComeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutCome);
            outComeSent = true;
        }
    });

    // End the request
    req.end();

};

// Process the check out come , update the check as needed , trigger an alert to user 
// special logic for accomodating a check that has never been tasted before   (don't alert on that one)
workers.processCheckOutcome = (originalCheckData, checkOutCome)=>{
    // Decide if the check is considered up or down
    let state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    // Decide if an alert is wanted
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

    // log the outcome
    let timeOfCheck = Date.now();
    workers.log(originalCheckData, checkOutCome, state, alertWanted, timeOfCheck);
    


    // Update the check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;


    // save the update
    _data.update('checks', newCheckData.id, newCheckData, (err)=>{
        if (!err) {
            // Send the new check data to the new phase in the process if needed
            if (alertWanted) {
                workers.alertUserToStatusChange(newCheckData);
            } else{
              console.log('Check outcome has not changed , no alert needed :)');
            }
          } else {
             console.log('Error trying to save updates to one of the checks')
         }
    })
}


// Alert to the user as to a change in their check status
workers.alertUserToStatusChange = (newCheckData)=>{
    let msg = 'Alert: Your check for '+newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is currently '+newCheckData.state;
    helpers.sendTwilioSms(newCheckData.userPhone, msg, (err)=>{
        if (!err) {
             console.log('Success!: User alerter by '+msg);
          } else {
            console.log('Error: Could not send sms alert to user who had a state change in their check');
         }
    })
}



// Define workers log function
workers.log = (originalCheckData, checkOutCome, state, alertWanted, timeOfCheck)=>{
    // Form the log data
    let logData = {
        'check': originalCheckData,
        'outcome': checkOutCome,
        'state': state,
        'alert': alertWanted,
        'time': timeOfCheck
    };
    // Convert data to string
    let logString = JSON.stringify(logData);

    // Determine the name of the log file 
    let logFileName = originalCheckData.id

    // append the log string to the file
    _logs.append(logFileName, logString, (err)=>{
        if (!err) {
            console.log('Logging to file succeeded'); 
          } else {
             console.log('Logging to file failed!');
         }
    })
}


// Timer to execute the worker process once per minute
workers.loop = ()=>{
    setInterval(() => {
        workers.gatherAllChecks()
    }, 1000*60);
}




// Timer to execute the log-rotation process once per day
workers.logRotationLoop = ()=>{
    setInterval(() => {
        workers.rotateLogs();
    }, 1000* 60 * 60 * 24);
}



//  Init script
workers.init  = () =>{
    // Execute all the checks
    workers.gatherAllChecks()

    // Call a loop so the checks will execute later on
    workers.loop();

    // Compress all the logs immediately
    workers.rotateLogs();

    // Call the compression loop so logs will be compressed later on
    workers.logRotationLoop();

}
 
 
// export the module.
module.exports = workers;
