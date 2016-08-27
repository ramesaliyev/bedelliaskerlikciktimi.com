/**
 * Get dependencies.
 */
const gulp = require('gulp'),
      stylus = require('gulp-stylus'),
      rename = require("gulp-rename");
/**
 * Tasks.
 */
gulp.task('stylus', function() {
  return gulp.src('./client/styles/index.styl')
    .pipe(stylus({
      compress: true
    }))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./public/css/'));
});

/**
 * Watchers.
 */
gulp.task('watch', ['stylus'], function() {
  gulp.watch('./client/styles/**/*', ['stylus']);
});

gulp.task('default', ['stylus']);
