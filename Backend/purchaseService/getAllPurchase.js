'use strict';
var AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.REGION
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {

  console.log(event);

  var params = {
    'TableName': process.env.TABLE_NAME
  };
  getAllPurchasesDB(params, callback);
};



var getAllPurchasesDB= function(params, callback){
  console.log("table name:",process.env.TABLE_NAME);
  console.log(params);
  docClient.scan(params, (err, result)=>{
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
      const response = {};
      if(result.Items){
        console.log("response", result);
        response.statusCode = 200;
        response.body = JSON.stringify({
          body: result.Items
        });
      }else{
        response.statusCode = 404;
        response.body = JSON.stringify({
          message: 'Resource not found'
        });
      }

      callback(null, response);
    }
  });
};
