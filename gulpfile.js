//npm install gulp gulp-ruby-sass gulp-plumber gulp-autoprefixer gulp-webserver

var gulp = require("gulp"),
    sass = require("gulp-ruby-sass"),
    plumber = require("gulp-plumber"),
    autoprefixer = require('gulp-autoprefixer'),
    webserver = require('gulp-webserver');

gulp.task("styles", function() {
    return sass("sass/*.scss")
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(plumber())
        .on("error", sass.logError)
        .pipe(gulp.dest("css"));
});


gulp.task("watch", function() {
    gulp.watch("sass/*.scss", ["styles"]);
});

gulp.task('webserver', function() {
    gulp.src('./')
        .pipe(webserver({
            fallback: 'index.html',
            livereload: true,
            directoryListing: true,
            open: true
        }));
});

gulp.task("default", ["styles", "watch", "webserver"]);