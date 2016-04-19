var status = require('http-status');

exports.$user = function ($http) {

    var s = {};

    s.loadUser = function () {

        //Get User Information
        $http
            .get('/api/v1/me')
            .success(function (data) {

                //Load User information from DB
                s.user = data.user;

            })
            .error(function (data, status) {

                //401
                if (status === status.UNAUTHORIZED) {
                    s.user = null;
                }

            });
    };


    //Loading User
    s.loadUser();



    setInterval(s.loadUser, 60 * 60 * 1000);

    return s;
};
