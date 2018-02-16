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

gulp.task("default", [
	"typescript",
]);