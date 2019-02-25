
/**
 * Dynamo DB setup
 * DATABASE SCHEMA
 * PaymentId_     : String
 * DiscordUserId  : String
 * DiscordName    : String
 * Status         : Enum(pending, canceled, success, failed)
 * ImageLink      : String
 * ImageName      : String
 * CreatedOn      : Date
 * CompletedOn    : Date
 */
var AWS = require("aws-sdk");

AWS.config.update({
  endpoint: process.env.DB_HOST,
  region: process.env.DB_REGION,
  credentials: new AWS.Credentials(process.env.DB_KEY, process.env.DB_SECRET)
});

var docClient = new AWS.DynamoDB.DocumentClient();

/**
 * Discord Bot
 */

const Discord = require("discord.js")
const client = new Discord.Client()
client.login(process.env.DISCORD_BOT)

/**
 * Paypal
 */
var paypal = require('paypal-rest-sdk');

paypal.configure({
  mode: process.env.PAYPAL_ENV, // Sandbox or live
  client_id: process.env.PAYPAL_ID,
  client_secret: process.env.PAYPAL_SECRET
});

/**
 * Cloudinary
 */
var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

var config = {
  docClient: docClient,
  Discord: Discord,
  client: client,
  paypal: paypal,
  cloudinary: cloudinary
}

module.exports = config;
