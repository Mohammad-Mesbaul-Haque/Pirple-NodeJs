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
const {parseJsonToObject} = require('./helpers')

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
        if (!err && data) {
            let parsedData = parseJsonToObject(data)
            callback(err, parsedData)
          } else {
        callback(err, data)
         }
    })
}

// Update data to file
lib.update = (dir, file, data, callback)=>{
    // open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err1, fileDescriptor)=>{
        if (!err1 && fileDescriptor) {
            //  Convert data to string
            let stringData = JSON.stringify(data);
            
            // Truncate the file
            fs.ftruncate(fileDescriptor, (err2)=>{
                if (!err2) {
                    //  Write to the file and close it
                    fs.writeFile(fileDescriptor, stringData,(err3)=>{
                        if (!err3) {
                            fs.close(fileDescriptor, (err4)=>{
                                if (!err4) {
                                    callback(false); 
                                  } else {
                                     callback('Error closing the file!');
                                 }
                            }) 
                          } else {
                             callback('Error writing to existing file')
                         }
                    })
                  } else {
                     callback('Error truncating file')
                 }
            })
          } else {
             callback('Could not open the file! It may not exist yet')
         }
    })
}
 
// Delete file function
lib.delete = (dir, file, callback)=>{
    // Unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',(err)=>{
        if (!err) {
            callback(false) 
          } else {
             callback('Error deleting file')
         }
    })
}




// List all the item in a directory
lib.list = (dir, callback)=>{
    fs.readdir(lib.baseDir+dir+'/', (err, data)=>{
         if (!err && data && data.length > 0) {
              let trimmedFileNames = [];
              data.forEach(fileName => {
                  trimmedFileNames.push(fileName.replace('.json', ''));
              });

              callback(false, trimmedFileNames)

           } else {
              callback(err, data)
          }
    })
}







 // export the module. 
module.exports = lib; 