var superagent = require('superagent');
var _ = require('underscore');

module.exports = function (Config) {

    //Hardcoded Exchange Rates
    var rates = {
        USD: 1,
        EUR: 1.1,
        GBP: 1.5
    };


    var url = 'http://openexchangerates.org/api/latest.json?app_id=' + Config.openExchangeRatesKey;


    var ping = function (callback) {

        //Making 'HTTP request'
        superagent.get(url, function (error, res) {

            // If error happens, ignore it because we'll try again in an hour
            if (error) {
                if (callback) {
                    callback(error);
                }
                return;
            }

            var results;
            try {

                //HTTP Response
                var results = JSON.parse(res.text);

                //Iterate Currency Values
                _.each(results.rates || {}, function (value, key) {
                    rates[key] = value;
                });


                if (callback) {
                    callback(null, rates);
                }

            } catch (e) {
                if (callback) {
                    callback(e);
                }
            }


        });


    };


    // call ping - Repeat every hour
    setInterval(ping, 60 * 60 * 1000);



    // Return the current state of the exchange rates
    var ret = function () {
        return rates;
    };
    ret.ping = ping;



    return ret;
};
