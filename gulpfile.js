const fs = require("fs");

const gulp    = require("gulp");
const sass    = require("gulp-sass");
const jsdoc   = require("gulp-jsdoc3");
const ts      = require("gulp-typescript");
const terser  = require("gulp-terser");
const webpack = require("webpack-stream");
const prefix  = require("gulp-autoprefixer");
const notify  = require("gulp-notify");
const tsProject    = ts.createProject('tsconfig.json');
const sassThemes   = require("./sass-themes.js");
const iconfont     = require("gulp-iconfont");
const runTimestamp = Math.round(Date.now() / 1000);

sass.compiler = require("node-sass");

gulp.task("iconfont", function(cb) {
    const fontName = "iconfont";
    return gulp.src(["./Kolan/wwwroot/res/icons/*.svg"])
        .pipe(iconfont({
            fontName: fontName,
            prependUnicode: true,
            formats: ["ttf", "eot", "woff"],
            timestamp: runTimestamp,
            normalize: true
        }))
        .on('glyphs', (glyphs) => {
            // Generate the css for the individual icons
            const glyphCss = glyphs.map(x => {
                const codepoint = "\\" + x.unicode.toString().codePointAt(0);
                return `.icon-${x.name}:before {\n\tcontent:"${x.unicode}"\n}`
            }).join("\n\n");

            fs.writeFile("./Kolan/wwwroot/scss/_glyphs.scss", glyphCss, cb);
        })
        .pipe(gulp.dest("./Kolan/wwwroot/res/fonts"));
});

gulp.task("sass", function() {
    return gulp.src("./Kolan/wwwroot/scss/**/*.scss")
        .pipe(sassThemes("themes/_*.scss", { cwd: "./Kolan/wwwroot/scss" }))
        .pipe(sass({
            outputStyle: "compressed"
        }).on("error", sass.logError))
        .pipe(prefix({
            browsers: ["last 2 versions"],
            cascade: false
        }))
        .pipe(gulp.dest("./Kolan/wwwroot/css"));
    //.pipe(notify("Sass compilation complete."));
});

gulp.task("ts", function() {
    return gulp.src("./Kolan/wwwroot/ts/**/*.ts")
        .pipe(tsProject())
        .pipe(gulp.dest("./Kolan/wwwroot/js"));
});

gulp.task("compress", () => {
    return gulp.src("./Kolan/wwwroot/js/**/*.js")
        .pipe(terser({
            compress: true,
            mangle: true
        }));
});

gulp.task('webpack', function() {
    return gulp.src('Kolan/wwwroot/js/views/boardsView.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('Kolan/wwwroot/dist/'));
    //.pipe(notify({ title: "Webpack complete", onLast: true }));
});

gulp.task('doc', function (cb) {
    const config = require('./jsdoc.json');
    gulp.src(['README.md'], {read: false})
        .pipe(jsdoc(config, cb));
});

gulp.task("watch", function() {
    gulp.watch("./Kolan/wwwroot/scss/**/*.scss", gulp.series("sass"));
    gulp.watch("./Kolan/wwwroot/ts/**/*.ts", gulp.series("ts"));
    gulp.watch("./Kolan/wwwroot/js/**/*.js", gulp.series("webpack"));
});

gulp.task("default", gulp.series("iconfont", "sass", "ts", "webpack", "watch"));
gulp.task("produce", gulp.series("iconfont", "sass", "ts", "compress", "doc", "webpack"));
