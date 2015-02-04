var gulp = require('gulp'),
	uglify = require('gulp-uglify');
	concat = require('gulp-concat');

gulp.task('minify', function () {
	gulp.src('src/js/*.js')
		.pipe(uglify())
		.pipe(concat('paint.js'))
		.pipe(gulp.dest('dist/js'))
});