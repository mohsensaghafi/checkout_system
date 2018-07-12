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
  var items = [];
  getAllRulesDB(params, items, callback);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};



var getAllRulesDB= function(params, items, callback){
  console.log("tablke name:",process.env.TABLE_NAME);
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
      console.log("in dbscan:",result);
      items = items.concat(result.Items);
      if(result.LastEvaluatedKey){
        params.ExclusiveStartKey = result.LastEvaluatedKey;
        getProductsDB(params, items);
      }else{
        const response = {
          statusCode: 200,
          body: JSON.stringify({
            body: items
          }),
        };

        callback(null, response);
      }
    }
  });
};
