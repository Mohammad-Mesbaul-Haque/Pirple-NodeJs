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
}

//  Production environment
environments.production = {
    'httpPort' : 5000,
    'httpsPort': 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisIsAlsoASecret'
}

// Determine which one should be exported according to the command line passing
let currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ?  process.env.NODE_ENV.toLowerCase() : '';

// Check that the current environment  is one of the environments above , if not set staging as default.
let environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the module
module.exports = environmentToExport;