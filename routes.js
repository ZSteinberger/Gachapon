var Config = require('./config.js')

var docClient = Config.docClient;
var Discord = Config.Discord;
var client = Config.client;
var paypal = Config.paypal;
var cloudinary = Config.cloudinary;

var appRouter = function (app) {
  app.get("/process", function (req, res) {
    console.log(req.query.paymentId);
    console.log(req.query.PayerID);
    //Query for database entry on paymentId
    var params = {
      TableName: "Transactions",
      Key: {
        "paymentId": req.query.paymentId
      }
    };

    docClient.get(params, function (err, data) {
      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        // console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        //if database entry status is pending
        if (data.Item.transactionStatus === "pending") {
          cloudinary.v2.api.resources({
              type: 'upload',
              prefix: 'Available'
            },
            function (error, result) {
              if (error != undefined) {
                // update datbase entry with failed, and send message to admin with details of transaction
                return res.send(error);
              } else if (result.resources.length > 0) {
                var winning = result.resources[Math.floor(Math.random() * result.resources.length)];
                let string = winning.public_id;
                string = string.replace(/^(Available)/, "Sold");
                cloudinary.v2.uploader.rename(winning.public_id, string, function (error, result) {
                  if (error != undefined) {
                    // update datbase entry with failed, and send message to admin with details of transaction
                    return res.send(error);
                  }
                  // update datbase entry with status complete, image url, tansactionTime, payerId
                  var params = {
                    TableName: "Transactions",
                    Key: {
                      "paymentId": req.query.paymentId
                    },
                    UpdateExpression: "set transactionStatus = :s, imagePublicId=:i",
                    ExpressionAttributeValues: {
                      ":s": "complete",
                      ":i": result.public_id
                    },
                    ReturnValues: "ALL_NEW"
                  };

                  console.log("Updating the item...");
                  docClient.update(params, function (err, data) {
                    if (err) {
                      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                      //need to send discord message with image
                      // console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
                      client.users.get(data.Attributes.discordUserId).send(result.secure_url);
                      // return res.sendFile(result.secure_url);
                      res.format({
                        'text/html': function(){
                          return res.send('<table width=100% height=100%><tr><td style="text-align: center; vertical-align: middle;"><img src="' + result.secure_url + '"/></td></tr></table>');
                        }
                      });
                    }
                  });
                });
              } else {
                // update datbase entry with failed, and send message to admin with details of transaction
                return res.send("Please contact seller for help stock ran out");
              }
            });
        } else if (data.Item.transactionStatus === "complete") {
          //else if  database entry status is complete
          //return the message based on database entry
          cloudinary.v2.image(data.Item.imagePublicId, function (error, result) {
            // return res.send("Your images was already sent to discord: " + result.secure_url);
            res.format({
              'text/html': function(){
                return res.send('<img src="' + result.secure_url + '"></img>');
              }
            });
          });
        } else {
          //else
          return res.send("No cheating you need to buy");
          //no cheating you need to buy
        }

      }
    });

    // return res.send("Thank you for your Purchase. If you don't recieve your Image through discord please dm me your paymentId: " + req.query.paymentId);
  });

  app.get("/cancel", function (req, res) {
    console.log(req.query.paymentId);
    console.log(req.query.PayerID);
    var params = {
      TableName: "Transactions",
      Key: {
        "paymentId": req.query.paymentId
      },
      UpdateExpression: "set transactionStatus = :s",
      ExpressionAttributeValues: {
        ":s": "failed"
      },
      ReturnValues: "ALL_NEW"
    };

    console.log("Updating the item...");
    docClient.update(params, function (err, data) {
      if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        //need to send discord message with image
        console.log(data.Attributes.paymentId + " Order canceled: " + data.Attributes.discordUserId);
        return res.send(" Order canceled: " + data.Attributes.discordUserName);
      }
    });
  });

  app.get("/preview", function(req, res){
    cloudinary.v2.api.resources({
      type: 'upload',
      prefix: 'Available'
    },
    function (error, result) {
      if (error != undefined) {
        // update datbase entry with failed, and send message to admin with details of transaction
        return res.send(error);
      } else if (result.resources.length > 0) {
        var html = ""
        // , { overlay: "cloudinary_icon", width: 80, 
        //      gravity: 'south_east', x: 5, y: 5, 
        //      opacity: 50, effect: "brightness:200" }
        result.resources.forEach(function (resource){
             html = html + cloudinary.image(resource.public_id, { format: 'jpg', quality: 10 }).toString()
        })
        res.format({
          'text/html': function(){
            return res.send(html)
          }
        });
      } else {
        // update datbase entry with failed, and send message to admin with details of transaction
        return res.send("Out of stock");
      }

    })
  })
}
module.exports = appRouter;