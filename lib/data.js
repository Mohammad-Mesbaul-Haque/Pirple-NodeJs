 /*
 * Title: Library for storing and editing data.
* Description: Library for storing and editing data. 
* Author: Mohammad Mesbaul Haque
* Github link: https://github.com/mmesba/pirple-nodejs
* Date: 20/12/2021
*/
 
// Dependencies
const fs = require('fs');
const path = require('path'); 

// App object or Module scaffolding. 
const lib = {} 

    // Define base dir 
    lib.baseDir = path.join(__dirname, "../.data/")


// main functions or objects.
// Write data to file
lib.create = function (dir, file, data, callback) {
    // Open file for writing   
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err1, fileDescriptor)=>{
        if(!err1&& fileDescriptor){
           // Convert data to string
           const stringData = JSON.stringify(data);
           // Write data to file and close it
           fs.writeFile(fileDescriptor, stringData, (err2)=>{  
               if (!err2) {    
                   fs.close(fileDescriptor, (err3)=>{
                       if(!err3){
                           callback(false);
                       }else{  
                           callback('Error closing the new file!')
                       }       
                   })
               } else {        
                callback('Error writing to new file!')
               }
           })
        }else{
            callback('Cannot create file, already exist!')     
        }
    })
}


//  Read data to file
lib.read = (dir, file, callback)=>{
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf-8', (err, data)=>{
        callback(err, data)
    })
}
 
 // export the module. 
module.exports = lib; 