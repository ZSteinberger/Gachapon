# Gachapon

This is a basic discord bot which will handle paypal link generation and distribution of art through the use of chat commands.

## How to use

  After this bot is added to a discord server, the bot will recognize various commands

- #gacharoll
  - Generates a paypal link for the user who types the command through a DM
- #gachapreview
  - Generates a link to preview the available art in the pool to sell

## APIs Used

1. AWS : used for the use of a DynamoDB databse to hold transaction information 
1. Cloudinary : Image storage and distribution of sold art
1. Paypal : Link generation and landing page for successful transactions