'use strict';
var AWS = require("aws-sdk");

AWS.config.update({
    region: process.env.REGION
});

var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.handler = (event, context, callback) => {

  console.log(event);
  const id = event.pathParameters.id;
  const body = JSON.parse(event.body);

  var params = {
    'TableName': process.env.TABLE_NAME,
    'Key': {
      'id' : id
    },
    UpdateExpression: "set package = :p",
    ExpressionAttributeValues:{
        ":p": body.package
    }
  };

  updateRulesDB(params, callback);
};



var updateRulesDB= function(params, callback){
  console.log("table name:",process.env.TABLE_NAME);
  console.log(params);
  docClient.update(params, (err, result)=>{
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
        statusCode: 201
      };
      callback(null, response);
    }
  });
};
