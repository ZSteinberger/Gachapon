var commands = {
  Gacharoll: function(cloudinary, paypal, docClient, recievedMessage){
    //Generate a payment link
    var payReq = JSON.stringify({
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: process.env.AWS_URL + '/process',
        cancel_url: process.env.AWS_URL + '/cancel'
      },
      transactions: [{
        amount: {
          total: '7',
          currency: 'USD'
        },
        description: 'This is the payment transaction description.'
      }]
    });

    cloudinary.v2.api.resources({
        type: 'upload',
        prefix: 'Available'
      },
      function (error, result) {
        if (result != undefined && result.resources.length > 0) {
          // console.log(result, result.resources.length);
          paypal.payment.create(payReq, function (error, payment) {
            var initialEntry = {
              TableName: "Transactions",
              Item: {
                "paymentId": payment.id,
                "discordUserId": recievedMessage.author.id,
                "discordUserName": recievedMessage.author.username,
                "transactionStatus": "pending"
              }
            };
            docClient.put(initialEntry, function (err, data) {
              if (err) {
                console.error("Unable to add transaction", payment.ide, ". Error JSON:", JSON.stringify(err, null, 2));
              } else {
                console.log("PutItem succeeded:", payment.id);
              }
            });
            var links = {};
            // console.log("WHAT IS THIS", payment);
            if (error) {
              console.error(JSON.stringify(error));
            } else {
              // Capture HATEOAS links
              payment.links.forEach(function (linkObj) {
                links[linkObj.rel] = {
                  href: linkObj.href,
                  method: linkObj.method
                };
              })
              // If the redirect URL is present, redirect the customer to that URL
              if (links.hasOwnProperty('approval_url')) {
                // Redirect the customer to links['approval_url'].href
                console.log(links['approval_url']);
                //Add paymentId and discord userId to database with status 
                recievedMessage.author.send("Please Purchase at this link: " + links['approval_url'].href)
                //create listener
              } else {
                console.error('no redirect URI present');
              }
            }
          });
        } else {
          recievedMessage.author.send("No adoptables available")
        }
      });
  },
  Preview: function(recievedMessage){
    recievedMessage.author.send(process.env.AWS_URL + '/preview')
  }
}

module.exports = commands;