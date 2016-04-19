var gulp = require('gulp'); //


// E.g. require('...') export.module --is not available in 'Browser Javascript'  --available only in NodeJS
// 'Browserify' Helps to convert [NodeJS] code int [Browser Javascript] Code
var browserify = require('gulp-browserify');


//Browserify also helps organize JS files
//
// Convert multiple files into One Single file
// So need not to worry about including multiple script tags.


//Gulp Task 'browserify'
gulp.task('browserify', function () {

    return gulp
        .src('./index.js')         //Src File
        .pipe(browserify())
        .pipe(gulp.dest('./bin')); //Output Folder

});


//.pipe()  //Gulp Streams
/*
    -concatenates files into one
    -removes console and debugger statements
    -minifies the code
    -puts the resulting file in a specific location
*/


//Gulp Task 'watch'
gulp.task('watch', function () {

    //Watching All JS Files in current directory  //and runs 'browserify' Gulp Task
    gulp.watch(['./*.js'], ['browserify']);
});
