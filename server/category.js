var mongoose = require('mongoose');

var categorySchema = {
    _id: {type: String},
    parent: {
        type: String,
        ref: 'Category'
    },
    ancestors: [{
        type: String,
        ref: 'Category'
    }]
};

//Exporting 'Category' Mongoose Schema
module.exports = new mongoose.Schema(categorySchema);

//Exporting Category [Plain JSON] --Not Mongoose Schema
//So that “Category” Document can been embedded into each “Product” Mongo Document
module.exports.categorySchema = categorySchema;
