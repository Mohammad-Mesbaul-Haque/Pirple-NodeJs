/*
 *
 Create and Export environment variables    
 */

//  Container for the object
let environments = {};

// Staging (Default) environment
environments.staging = {
    'httpPort' : 3000,
    'httpsPort': 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : 'fdkgglksdfjg8e475tjksdfj9i4',
        'authToken' : 'fkjasej894u5ksdjfiue4wr',
        'fromPhone' : '3487589'
    },
    'templateGlobals' : {
        'appName' : 'UptimeChecker',
        'companyName' : 'NotARealCompany, Inc',
        'yearCreated' : '2018',
        'baseUrl': 'http://localhost:3000/'
    }
}

//  Production environment
environments.production = {
    'httpPort' : 5000,
    'httpsPort': 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisIsAlsoASecret',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid' : 'fdkgglksdfjg8e475tjksdfj9i4',
        'authToken' : 'fkjasej894u5ksdjfiue4wr',
        'fromPhone' : '3487589'
    },
    'templateGlobals' : {
        'appName' : 'UptimeChecker',
        'companyName' : 'NotARealCompany, Inc',
        'yearCreated' : '2018',
        'baseUrl': 'http://localhost:5000/'
    }
}

// Determine which one should be exported according to the command line passing
let currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ?  process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment  is one of the environments above , if not set staging as default.
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;