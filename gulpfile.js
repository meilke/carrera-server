'use strict';

let gulp          = require('gulp-help')(require('gulp'));
let jasmine       = require('gulp-jasmine');
let SpecReporter  = require('jasmine-spec-reporter');

gulp.task('test', function () {
  return gulp.src(['test/**/*.spec.js'])
        .pipe(jasmine({
          reporter: new SpecReporter()
        }));
});

gulp.task('default', ['test']);