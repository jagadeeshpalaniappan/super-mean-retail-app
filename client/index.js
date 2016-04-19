var controllers = require('./controllers');
var directives = require('./directives');
var services = require('./services');
var _ = require('underscore');


//Register Angular App Module [Components]
var components = angular.module('mean-retail.components', ['ng']);


//Iterate All Controllers
_.each(controllers, function (controller, name) {

    //Register each Angular Controller
    components.controller(name, controller);

});


//Iterate All Directives
_.each(directives, function (directive, name) {

    //Register each Angular Directive
    components.directive(name, directive);

});


//Iterate All Services
_.each(services, function (factory, name) {

    //Register each Angular Service
    components.factory(name, factory);

});



//Register Angular App Module [app]

var app = angular.module('mean-retail', ['mean-retail.components', 'ngRoute']);

app.config(function ($routeProvider) {

    //Angular NG Route

    $routeProvider.
        when('/category/:category', {
            templateUrl: '/templates/category_view.html'
        }).
        when('/checkout', {
            template: '<checkout></checkout>'
        }).
        when('/product/:id', {
            template: '<product-details></product-details>'
        })


        .when('/', {
            templateUrl: "/templates/home.html"
        })
        .otherwise({redirectTo: '/'});


});


