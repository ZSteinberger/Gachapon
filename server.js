require('custom-env').env('prod')
var Config = require('./config.js')

var docClient = Config.docClient;
var Discord = Config.Discord;
var client = Config.client;
var paypal = Config.paypal;
var cloudinary = Config.cloudinary;

var Commands = require('./commands');

/**
 * Express
 */
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

var routes = require("./routes.js")(app);

var server = app.listen(process.env.SERVER_PORT, function () {
  console.log("Listening on port %s...", server.address().port);
});

client.on("ready", () => {
  console.log("Connected as " + client.user.tag)
  client.guilds.forEach((guild) => {
    console.log(guild.name)
    guild.channels.forEach((channel) => {
      console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
      if(channel.name === "general")
        channel.send("Hello World!")
    })
  })
})

client.on("message", (recievedMessage) => {
  if (recievedMessage.author == client.user) {
    return
  }
  // console.log("Recieved Message, " + recievedMessage.author.id + " : " + recievedMessage.author.username + ": " + recievedMessage.content)
  if (recievedMessage.content == "#gacharoll") {
    Commands.Gacharoll(cloudinary, paypal, docClient, recievedMessage)
  }
  if (recievedMessage.content == "#gachapreview") {
    Commands.Preview(recievedMessage)
  }
})