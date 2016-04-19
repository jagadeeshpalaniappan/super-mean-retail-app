var Category = require('./category');
var mongoose = require('mongoose');

module.exports = function (db, fx) {

    var productSchema = {

        name: {type: String, required: true},

        // Pictures must start with "http://"
        pictures: [{type: String, match: /^http:\/\//i}],

        price: {
            amount: {
                type: Number,
                required: true,

                //Overriding 'price' Property Setter
                set: function (v) {

                    //Updating 'approximatePriceUSD' -whenever we change 'price' property
                    this.internal.approximatePriceUSD = v / (fx()[this.price.currency] || 1);

                    //NOT CHANGING - 'price' property value
                    return v;
                }
            },
            // Only 3 supported currencies for now
            currency: {
                type: String,
                enum: ['USD', 'EUR', 'GBP'],
                required: true,

                //Overriding 'currency' Property Setter
                set: function (v) {

                    //Setting 'approximatePriceUSD' -for Fixed Currency
                    this.internal.approximatePriceUSD = this.price.amount / (fx()[v] || 1);

                    //NOT CHANGING - 'currency' property value
                    return v;
                }
            }
        },

        //Embedding the Category Schema 'Plain JSON' [Not Mongoose Schema]
        category: Category.categorySchema,

        internal: {
            approximatePriceUSD: Number  //Fixed Currency (USD) -helps for sorting by price
        }
    };



    var schema = new mongoose.Schema(productSchema);


    //Product Text Search: searches only in indexed properties
    schema.index({name: 'text'});


    //To include in 'displayPrice' virtual property
    var currencySymbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };



    /*
     * Human-readable string form of price - "$25" rather
     * than "25 USD"
     */
    // 'virtual' Property //not persisted to the database
    // But it can be accessed like other DB properties

    schema.virtual('displayPrice').get(function () {
        return currencySymbols[this.price.currency] +
            '' + this.price.amount;
    });



    //By default, .toObject() .toJSON() --do not include 'virtual' properties
    schema.set('toObject', {virtuals: true});
    schema.set('toJSON', {virtuals: true});



    //Exporting 'Product' Models
    return db.model('Product', schema, 'products');

};
