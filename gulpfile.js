const gulp = require("gulp");
const stylus = require("gulp-stylus");
// const postcss = require("gulp-postcss");
// const autoprefixer = require("autoprefixer");
// const cssnano = require("cssnano");
// const mqpacker = require("css-mqpacker");
// const minify = require("gulp-minify");
// const htmlmin = require("gulp-htmlmin");
// const concat = require("gulp-concat");
const typescript = require("gulp-typescript");

gulp.task("stylus", () => {
	gulp.src("./src/styl/*.styl")
		.pipe(stylus())
		// .pipe(concat("./main.css"))
		// .pipe(postcss([
		// 	mqpacker,
		// 	autoprefixer,
		// 	cssnano,
		// ]))
		.pipe(gulp.dest("./dist/css/"));
});

gulp.task("typescript", () => {
	gulp.src("./src/ts/**/*.ts")
		.pipe(typescript({
			noImplicitAny: true,
			removeComments: true,
			charset: "UTF8",
			target: "ES2015",
			moduleResolution: "classic",
			module: "commonjs",
		})).js
		// .pipe(minify({
		// 	ext: ".js",
		// }))
		.pipe(gulp.dest("./dist/js/"));
});

gulp.task("html", () => {
	gulp.src("./src/index.html")
		// .pipe(htmlmin({
		// 	useShortDoctype: true,
		// 	removeComments: true,
		// 	removeTagWhitespace: true,
		// }))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("default", [
	"stylus",
	"typescript",
	"html",
]);