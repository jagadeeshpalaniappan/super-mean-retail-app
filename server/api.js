var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var _ = require('underscore');

module.exports = function (wagner) {


    //New Express Router
    var api = express.Router();

    //Attach: 'BodyParser' with Express ROUTER
    api.use(bodyparser.json());


    //####### Routes ###########

    /* ------------------------- Category API --------------------------*/
    // Find Category -By Category Id
    api.get('/category/id/:id', wagner.invoke(function (Category) {


        return function (req, res) {
            //----

            Category.findOne({_id: req.params.id}, function (error, category) {

                //Error
                if (error) {
                    return res.
                        status(status.INTERNAL_SERVER_ERROR).
                        json({error: error.toString()});
                }

                //Category Not Found
                if (!category) {
                    return res.
                        status(status.NOT_FOUND).
                        json({error: 'Not found'});
                }


                //Sending 'category' JSON object response
                res.json({category: category});

            });


            //----
        };


    }));


    // Find Categories -By Parent Category Id
    api.get('/category/parent/:id', wagner.invoke(function (Category) {

        return function (req, res) {
            //--

            //Sort By Category Id (so that the Category Hierarchy order is maintained)
            var sort = {_id: 1};

            Category
                .find({parent: req.params.id})
                .sort(sort)
                .exec(function (error, categories) {

                    if (error) {
                        return res.
                            status(status.INTERNAL_SERVER_ERROR).
                            json({error: error.toString()});
                    }

                    res.json({categories: categories});

                });

            //--
        };


    }));


    /* ------------------------- Product API ---------------------------*/

    // Find Product -By Product Id
    api.get('/product/id/:id', wagner.invoke(function (Product) {

        return function (req, res) {

            Product.findOne({_id: req.params.id},
                handleOne.bind(null, 'product', res));

        };

    }));

    // Find Products -By Category Id
    api.get('/product/category/:id', wagner.invoke(function (Product) {


        return function (req, res) {

            //Sort -By Name [default]
            var sort = {name: 1};

            //Sort -By Price [low to high]
            if (req.query.price === "1") {

                sort = {'internal.approximatePriceUSD': 1};

            //Sort -By Price [high to low]
            } else if (req.query.price === "-1") {

                sort = {'internal.approximatePriceUSD': -1};
            }



            Product
                .find({'category.ancestors': req.params.id})
                .sort(sort)
                .exec(handleMany.bind(null, 'products', res));


        };


    }));

    // Find Product -By Text Search (sort by 'text score' relavence)
    api.get('/product/text/:query', wagner.invoke(function (Product) {
        return function (req, res) {

            //Text Search
            var query = {$text: {$search: req.params.query}};

            //Including Text Score also -as part of Projection 'score'
            var projection = {score: {$meta: 'textScore'}};

            //Sorting By Text Score
            var sort = {score: {$meta: 'textScore'}};

            Product
                .find(query, projection)
                .sort(sort)
                .limit(10)
                .exec(handleMany.bind(null, 'products', res));
        };
    }));


    /* ------------------------- User API ---------------------------*/

    //UPDATE: User's Cart information
    api.put('/me/cart', wagner.invoke(function (User) {

        //--
        return function (req, res) {

            try {
                //Cart -data from body
                var cart = req.body.data.cart;
            } catch (e) {
                return res
                    .status(status.BAD_REQUEST)
                    .json({error: 'No cart specified!'});
            }

            //Update the User's Cart -data
            req.user.data.cart = cart;

            //Update User mongo document
            req.user.save(function (error, user) {

                //Error
                if (error) {
                    return res.
                        status(status.INTERNAL_SERVER_ERROR).
                        json({error: error.toString()});
                }

                //Send 'user' Response
                return res.json({user: user});
            });


        };

        //--
    }));



    // Get User Information
    api.get('/me', function (req, res) {

        //If 'user' object is not available in request object
        //Means, User is Not Logged In
        if (!req.user) {
            return res.
                status(status.UNAUTHORIZED).
                json({error: 'Not logged in'});
        }

        //Authentication Success

        //Populate the User's Cart information into 'req.user' object
        var populateQuery = {path: 'data.cart.product', model: 'Product'};

        req.user.populate(populateQuery, handleOne.bind(null, 'user', res));


    });


    /* ------------------------- Stripe Checkout API [FOR PAYMENT]---------------------------*/
    api.post('/checkout', wagner.invoke(function (User, Stripe) {
        return function (req, res) {

            //User Not Logged In
            if (!req.user) {
                return res.
                    status(status.UNAUTHORIZED).
                    json({error: 'Not logged in'});
            }

            // Populate the products in the user's cart
            req.user.populate({path: 'data.cart.product', model: 'Product'}, function (error, user) {

                // Sum up the total price in USD
                var totalCostUSD = 0;
                _.each(user.data.cart, function (item) {
                    totalCostUSD += item.product.internal.approximatePriceUSD *
                        item.quantity;
                });

                // And create a charge in Stripe corresponding to the price
                Stripe.charges.create(
                    {
                        // Stripe wants price in cents, so multiply by 100 and round up
                        amount: Math.ceil(totalCostUSD * 100),
                        currency: 'usd',
                        source: req.body.stripeToken,
                        description: 'Example charge'
                    },
                    function (err, charge) {
                        if (err && err.type === 'StripeCardError') {
                            return res.
                                status(status.BAD_REQUEST).
                                json({error: err.toString()});
                        }
                        if (err) {
                            console.log(err);
                            return res.
                                status(status.INTERNAL_SERVER_ERROR).
                                json({error: err.toString()});
                        }

                        req.user.data.cart = [];
                        req.user.save(function () {
                            // Ignore any errors - if we failed to empty the user's
                            // cart, that's not necessarily a failure

                            // If successful, return the charge id
                            return res.json({id: charge.id});
                        });
                    });
            });
        };
    }));


    return api;
};



/*
*
* Common Util Fn
*   -to handle the Mongo Query Results
*
*
* */


//handle one -Mongo Query Result
function handleOne(property, res, error, doc) {

    //If any Error occurred -while querying Mongo Docs
    if (error) {
        return res.
            status(status.INTERNAL_SERVER_ERROR).
            json({error: error.toString()});
    }

    //if 'Mongo Doc' -Not available (No records found)
    if (!doc) {
        return res.
            status(status.NOT_FOUND).
            json({error: 'Not found'});
    }


    //Send Response
    var json = {};
    json[property] = doc;
    res.json(json);
}


//handle many -Mongo Query Results
function handleMany(property, res, error, results) {

    //If any Error occurred -while querying Mongo Docs
    if (error) {
        return res.
            status(status.INTERNAL_SERVER_ERROR).
            json({error: error.toString()});
    }

    //Send Response
    var json = {};
    json[property] = results;
    res.json(json);
}
