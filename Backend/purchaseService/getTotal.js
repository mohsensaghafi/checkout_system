'use strict';
const https = require('https');

module.exports.handler = (event, context, callback) => {

  console.log(event);
  const id = event.pathParameters.id;

  const endpoint = process.env.SERVICE_END_POINT;
  const actions = [];

  actions.push(getData(endpoint+"/products"));
  actions.push(getData(endpoint+`/pricing_rules/${id}`));
  actions.push(getData(endpoint+`/purchase/${id}`));


  Promise.all(actions).then((data)=>{
    const products = {};
    const productsObj = JSON.parse(data[0]);
    if(productsObj && productsObj["body"]){
      productsObj["body"].forEach((product)=>{
        products[product.id] = product.price;
      });
    }

    const pricingRules = {};
    const pricingRuleObj = JSON.parse(data[1]);
    if(pricingRuleObj && pricingRuleObj["body"] && pricingRuleObj["body"]["package"]){
      if(pricingRuleObj["body"]["package"]["discount"]){
        pricingRuleObj["body"]["package"]["discount"].forEach((pricingRule)=>{
          if(!pricingRules[pricingRule.product]){
            pricingRules[pricingRule.product] = [];
          }
          pricingRule["type"] = "discount";
          pricingRules[pricingRule.product].push(pricingRule);
        });
      }
      if(pricingRuleObj["body"]["package"]["deal"]){
        pricingRuleObj["body"]["package"]["deal"].forEach((pricingRule)=>{
          if(!pricingRules[pricingRule.product]){
            pricingRules[pricingRule.product] = [];
          }
          pricingRule["type"] = "deal";
          pricingRules[pricingRule.product].push(pricingRule);
        });
      }
    }

    var purchaseList = [];
    const purchaseObj = JSON.parse(data[2]);
    if(purchaseObj && purchaseObj["body"]){
      purchaseList = purchaseObj["body"]["purchase_list"];
    }

    var actions = [];
    purchaseList.forEach((purchase)=>{
      const id = purchase['id'];
      actions.push(calcPrice(purchase, pricingRules[id], products[id]));
    });
    Promise.all(actions).then((results)=>{
      console.log("Results", results);
      const total = results.reduce((a, b) => a + b, 0.0);
      console.log("total", total);
      const response = {
        statusCode: 200,
        body: JSON.stringify({
          "total": total
        })
      };
      callback(null, response);
    }).catch((error)=>{
      const response = {
        statusCode: 500,
        body: JSON.stringify({
          "Error": error
        })
      };
      callback(null, response);
    });

  }).catch((err)=>{
    console.log("Error:", err);
    const response = {
      statusCode: 500,
      body: JSON.stringify({
        "Error": err
      })
    };
    callback(null, response);
  });
};



var getData = function(url){
  return new Promise((resolve, reject)=>{
    https.get(url, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(data);
      });

    }).on("error", (err) => {
      reject(err);
    });

  });
};


var calcPrice = function(purchase, rules, price){
  return new Promise((resolve, reject)=>{
    const prices = [];
    const count = purchase["count"];

    if(rules){
      rules.forEach((rule) =>{
        if(rule["type"] == "discount" && rule['min-purchase'] <= count){
          prices.push(rule['price'] * count);
        }else if(rule["type"] == "deal"){
          const deal_cnt = Math.floor(count / rule['count-get']);
          const reminder = count % rule['count-get'];
          var p = deal_cnt * rule['count-pay'] * price;
          p += reminder * price;
          prices.push(p);
        }
      });
      resolve(Math.min(...prices));
    }else{
      resolve(price * count);
    }
    reject("Error");
  });

};
