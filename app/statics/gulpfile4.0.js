var gulp = require('gulp')
var minifyCss = require('gulp-minify-css')
var uglify = require('gulp-uglify')
var clean = require('gulp-clean')
var argv = require('optimist').argv
var babel = require('gulp-babel')
var livereload = require('gulp-livereload')
var path = require('path')
var htmlmin = require('gulp-htmlmin')
var gulpif = require('gulp-if')
//var imageMin = require('gulp-imagemin')
var fs = require('fs')
var SRC = "src"
var DEST = 'target'
var production = false
if (argv.p) {
    production = true
}
gulp.task('styles', function () {
    return gulp.src(['src/**/!(xenon|*.min).css'])
        //.pipe(cached("styles"))
        .pipe(gulpif(production, minifyCss()))
        .pipe(gulp.dest(DEST))
})
gulp.task('scripts', function (cb) {
    return gulp.src('src/**/!(*.min).js')
        //.pipe(cached("scripts"))
        //.pipe(jshint('.jshintrc'))
        //.pipe(jshint.reporter('default'))
        //.pipe('')
        .pipe(babel({blacklist: 'useStrict'}))//使用非严格模式为了兼容旧代码
        .pipe(gulpif(production, uglify()))
        .pipe(gulp.dest(DEST))
        .on('finish', cb)
})
gulp.task('htmls', function (cb) {
    return gulp.src('src/**/*.html')
        .pipe(gulpif(production, htmlmin({
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true
        })))
        .pipe(gulp.dest(DEST))
        .on('finish', cb)
})
gulp.task('images', function () {

    //return gulp.src('src/**/*.+(png|jpeg|gif|jpg)')
    //    .pipe(imageMin())
    //    .pipe(gulp.dest(DEST))
})
gulp.task('clean', function (cb) {
    if (fs.existsSync(DEST)) {
        gulp.src(DEST, {read: false})
            .pipe(clean({force: true}))
            .on('finish', function () {
                fs.mkdirSync(DEST)
                cb()
            })
    } else {
        fs.mkdirSync(DEST)
        cb()
    }

})
gulp.task('copy', function (cb) {
    return gulp.src('src/**/*')
        .pipe(gulp.dest(DEST))
        .on('finish', cb)
})
gulp.task('watch', function () {
    //处理未捕获的异常，防止watch退出
    process.on('uncaughtException', function (err) {
        console.log(err)
        console.log(err.stack)
    })
    livereload({
        start: true
    })
    var watcher = gulp.watch('src/**/*', function () {
    })
    watcher.on('change', function (filePath) {
        if (/\.js$/.test(filePath)) {
            gulp.src(filePath, {base: SRC})
                .pipe(babel({blacklist: 'useStrict'}))
                .pipe(gulp.dest(DEST))
        } else {
            gulp.src(filePath, {base: SRC})
                .pipe(gulp.dest(DEST))
        }
        livereload.changed(path.join(__dirname, filePath))
    })
})
gulp.task('default', gulp.series('clean', 'copy', gulp.parallel('scripts', 'styles', 'htmls')))
gulp.task('help', function (cb) {
    console.log('gulp:执行构建(开发环境)')
    console.log('gulp watch:开发环境使用，配合livereload可以实现实时刷新页面')
    console.log('gulp -p:执行构建(生产环境)')
    cb()
})