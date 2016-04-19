var fs = require('fs');
var fx = require('./fx');
var Stripe = require('stripe');

module.exports = function(wagner) {

  //Stripe Payment - Wagner Dependency Added
  wagner.factory('Stripe', function(Config) {
    return Stripe(Config.stripeKey);
  });

  //Foreign Exchange Rates API
  wagner.factory('fx', fx);

  //Config: Facebook, Stripe, Open Exchange
  wagner.factory('Config', function() {
    return JSON.parse(fs.readFileSync('./config.json').toString());
  });


};
