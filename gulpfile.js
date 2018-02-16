const gulp = require("gulp");
const typsecript = require("gulp-typescript");

gulp.task("typescript", () => {
	gulp.src("./models/*.ts")
		.pipe(typsecript({
			noImplicitAny: true,
			removeComments: true,
			charset: "UTF8",
			target: "ES2015",
			moduleResolution: "classic",
			module: "commonjs",
		})).js
		.pipe(gulp.dest("./dist/js/"));
});

gulp.task("html", () => {
	gulp.src("./src/index.html")
		.pipe(gulp.dest("./dist/"));
});

gulp.task("default", [
	"typescript",
	"html",
]);