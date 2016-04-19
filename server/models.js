var mongoose = require('mongoose');
var _ = require('underscore');

module.exports = function (wagner) {

    //----------------------------------------

    // Build the connection string
    var dbURI = 'mongodb://localhost:27017/test';

    // Create the database connection
    mongoose.connect(dbURI);

    // MONGOOSE -CONNECTION EVENTS
    // When successfully connected
    mongoose.connection.on('connected', function () {
        console.log('### MongoDB Connection Established');
    });

    // If the connection throws an error
    mongoose.connection.on('error', function (err) {
        console.log('### ERROR: MongoDB Connection');
        console.log(err);
        process.exit(1);
    });

    // When the connection is disconnected
    mongoose.connection.on('disconnected', function () {
        console.log('### MongoDB Connection Disconnected');
        process.exit(1);
    });


    // If the Node process ends, close the MongoDB connection
    process.on('SIGINT', function () {
        mongoose.connection.close(function () {
            console.log('### Closing the MongoDB Connection: Since Node Process is getting ended');
            process.exit(0);
        });
    });

    //----------------------------------------

    //Adding Wagner Dependencies: Mongoose
    wagner.factory('db', function () {
        return mongoose;
    });


    //Mongoose Models
    var Category = mongoose.model('Category', require('./category'), 'categories');
    var User = mongoose.model('User', require('./user'), 'users');

    var models = {
        Category: Category,
        User: User
    };


    // To ensure DRY-ness, register factories in a loop
    _.each(models, function (value, key) {

        //Adding Wagner Dependencies: Category,User  Db Models
        wagner.factory(key, function () {
            return value;
        });

    });


    //Adding Wagner Dependencies: Product  Db Model
    wagner.factory('Product', require('./product'));

    return models;
};
