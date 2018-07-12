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
  getRulesDB(params, callback);
};



var getRulesDB= function(params, callback){
  console.log("table name:",process.env.TABLE_NAME);
  console.log(params);
  docClient.get(params, (err, result)=>{
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
      if(result.Item){
        console.log("response", result);
        response.statusCode = 200;
        response.body = JSON.stringify({
          body: result.Item
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
