const azure = require('azure-storage');
const devCred = azure.generateDevelopmentStorageCredentials();

let blobService = azure.createBlobService(devCred);
console.log(devCred);
blobService.createContainer('materials', (error, result, response)=>{
    if(error){
        console.log(error);
    }
    console.log(result, response);
})