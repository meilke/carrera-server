'use strict';

let gulp          = require('gulp-help')(require('gulp'));
let jasmine       = require('gulp-jasmine');
let karma         = require('gulp-karma');
let SpecReporter  = require('jasmine-spec-reporter');

gulp.task('test-server', function () {
  return gulp.src(['test/lib/**/*.spec.js'])
        .pipe(jasmine({
          reporter: new SpecReporter()
        }));
});

gulp.task('test-client', function() {
  // Be sure to return the stream
  // NOTE: Using the fake './foobar' so as to run the files
  // listed in karma.conf.js INSTEAD of what was passed to
  // gulp.src !
  return gulp.src('./foobar')
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))/*
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      console.log(err);
      this.emit('end'); //instead of erroring the stream, end it
    })*/;
});

gulp.task('default', ['test-server', 'test-client']);