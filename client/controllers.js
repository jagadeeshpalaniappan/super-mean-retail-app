

exports.AddToCartController = function ($scope, $http, $user, $timeout) {


    $scope.addToCart = function (product) {

        var obj = {product: product._id, quantity: 1};

        //Update the User Cart -locally
        $user.user.data.cart.push(obj);

        //Update the User Cart -in Database
        $http.
            put('/api/v1/me/cart', {data: {cart: $user.user.data.cart}}).
            success(function (data) {

                //Get the Updated User -from DB
                $user.loadUser();
                $scope.success = true;

                //Waiting for Load User AJAX--TODO: not good
                $timeout(function () {
                    $scope.success = false;
                }, 5000);

            });
    };


};



exports.CategoryProductsController = function ($scope, $routeParams, $http) {

    //Category -from Route Params
    var encoded = encodeURIComponent($routeParams.category);

    $scope.price = undefined;

    $scope.handlePriceClick = function () {
        if ($scope.price === undefined) {
            $scope.price = -1;
        } else {
            $scope.price = 0 - $scope.price;
        }
        $scope.load();
    };



    $scope.load = function () {

        var queryParams = {price: $scope.price};

        //Get Products -By Category
        $http
            .get('/api/v1/product/category/' + encoded, {params: queryParams})
            .success(function (data) {
                $scope.products = data.products;
            });
    };



    $scope.load();



    //Why??
    setTimeout(function () {
        $scope.$emit('CategoryProductsController');
    }, 0);

};




exports.CategoryTreeController = function ($scope, $routeParams, $http) {


    var encoded = encodeURIComponent($routeParams.category);


    //Get Category -by Id
    //http://localhost:3000/api/v1/category/id/Books
    $http
        .get('/api/v1/category/id/' + encoded)
        .success(function (data) {

            //{"category":{"_id":"Books","ancestors":["Books"]}}

            //Category
            $scope.category = data.category;


            //Get Child Categories -by Parent Category Id
            //http://localhost:3000/api/v1/category/parent/Books
            $http
                .get('/api/v1/category/parent/' + encoded)
                .success(function (data) {

                    //data.categories :
                    //[{"_id":"Fiction","parent":"Books","ancestors":["Books","Fiction"]},{"_id":"Non-Fiction","parent":"Books","ancestors":["Books","Non-Fiction"]}]


                    //Child Categories
                    $scope.children = data.categories;


                });


        });


    //Refresh  //Why?
    setTimeout(function () {
        $scope.$emit('CategoryTreeController');
    }, 0);


};





exports.CheckoutController = function ($scope, $user, $http) {

    // For update cart
    $scope.user = $user;



    $scope.updateCart = function () {

        //Update the User Cart information
        $http.
            put('/api/v1/me/cart', $user.user).
            success(function (data) {
                $scope.updated = true;
            });

    };


    //Stripe Publishable Key, Stripe Token

    // For checkout
    Stripe.setPublishableKey('pk_test_KVC0AphhVxm52zdsM4WoBstU');


    $scope.stripeToken = {
        number: '4242424242424242',
        cvc: '123',
        exp_month: '12',
        exp_year: '2016'
    };





    $scope.checkout = function () {

        $scope.error = null;

        //Stripe Checkout -Processing Payment
        Stripe.card.createToken($scope.stripeToken, function (status, response) {

            //Payment Process -Error
            if (status.error) {
                $scope.error = status.error;
                return;
            }


            //Payment Process -Success
            //Reset User Cart Information -database
            $http.
                post('/api/v1/checkout', {stripeToken: response.id}).
                success(function (data) {

                    //Checkout Completed
                    $scope.checkedOut = true;

                    //Reset User Cart Information -locally
                    $user.user.data.cart = [];

                });


        });


    };


};




exports.NavBarController = function ($scope, $user) {
    $scope.user = $user;


    //Why?
    setTimeout(function () {
        $scope.$emit('NavBarController');
    }, 0);

};




exports.ProductDetailsController = function ($scope, $routeParams, $http) {

    var encoded = encodeURIComponent($routeParams.id);

    //Get Product Details -By Id
    $http.
        get('/api/v1/product/id/' + encoded).
        success(function (data) {
            $scope.product = data.product;
        });



    setTimeout(function () {
        $scope.$emit('ProductDetailsController');
    }, 0);


};
