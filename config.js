var cfg = {};

// HTTP Port to run our web application
cfg.port = process.env.PORT || 3000;

// A random string that will help generate secure one-time passwords and
// HTTP sessions
cfg.secret = process.env.APP_SECRET || 'keyboard cat';

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
// 
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
//cfg.accountSid = process.env.TWILIO_ACCOUNT_SID;
//cfg.authToken = process.env.TWILIO_AUTH_TOKEN;

cfg.accountSid = 'ACbecdea3184337764026820082dc6c6d6';
cfg.authToken = 'fa1ca923f9cb050e0baf341368a0c4e6'; 

// A Twilio number you control - choose one from:
// https://www.twilio.com/user/account/phone-numbers/incoming
// Specify in E.164 format, e.g. "+16519998877"
cfg.twilioNumber = "+16468464357";

// MongoDB connection string - MONGO_URL is for local dev,
// MONGOLAB_URI is for the MongoLab add-on for Heroku deployment
cfg.mongoUrl = process.env.MONGOLAB_URI || process.env.MONGO_URL || "mongodb://localhost/SubscriberSchema"

// Export configuration object
module.exports = cfg;