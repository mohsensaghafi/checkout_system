'use strict';
var AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.REGION
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {

  console.log(event);
  const id = event.pathParameters.id;

  var params = {
    'TableName': process.env.TABLE_NAME,
    'Key': {
      'id' : id
    }
  };
  deletePurchaseDB(params, callback);
};



var deletePurchaseDB= function(params, callback){
  console.log("table name:",process.env.TABLE_NAME);
  console.log(params);
  docClient.delete(params, (err, result)=>{
    if(err){
      console.error(err);
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          error: JSON.stringify(err)
        }),
      };

      callback(null, response);
    }else{
      console.log("result", result);
      const response = {
        statusCode: 204
      };
      callback(null, response);
    }
  });
};
