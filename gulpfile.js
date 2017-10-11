var gulp = require('gulp'),
    concat = require('gulp-concat'),//- 多个文件合并为一个；
    cleanCSS = require('gulp-clean-css'),//- 压缩CSS为一行；
    ugLify = require('gulp-uglify'),//压缩js
    imageMin = require('gulp-imagemin'),//压缩图片
    pngquant = require('imagemin-pngquant'), // 深度压缩
    htmlMin = require('gulp-htmlmin'),//压缩html
    changed = require('gulp-changed'),//检查改变状态
    data = require('gulp-data'),
    stylus = require('gulp-stylus'),//压缩合并stylus
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    del = require('del'),
    babel = require('gulp-babel'),
    browserSync = require("browser-sync").create(),//浏览器实时刷新
    px2rem = require('postcss-px2rem'),
    polyfiller = require('gulp-polyfiller');

//删除dist下的所有文件
gulp.task('delete', function (cb) {
    return del(['dist/*'], cb);
})

//压缩html
gulp.task('html', function () {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    gulp.src('src/index.html')
        .pipe(changed('dist', {hasChanged: changed.compareSha1Digest}))
        // .pipe(htmlMin(options))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({stream: true}));
});

//实时编译stylus
gulp.task('stylus', function () {
    var processors = [px2rem({remUnit: 75})];
    gulp.src(['./src/stylus/*.styl']) //多个文件以数组形式传入
        .pipe(changed('dist/css', {hasChanged: changed.compareSha1Digest}))
        .pipe(stylus())
        // .pipe(concat('main.css'))
        .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
        .pipe(postcss(processors))
        // .pipe(cleanCSS())
        .pipe(gulp.dest('dist/css'))//将会在css下生成main.css
        .pipe(browserSync.reload({stream: true}));
});

//压缩js
gulp.task("script", function () {
    return gulp.src(['src/js/*.js'])
        .pipe(changed('dist/js', {hasChanged: changed.compareSha1Digest}))
        .pipe(babel({
            presets: ['es2015']
        }))
        // 转换es6中的api
        // .pipe(polyfiller(['Promise', 'Fetch']))

        // .pipe(concat('index.js'))
        // .pipe(ugLify())
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({stream: true}));
});

// 压缩图片
gulp.task('images', function () {
    gulp.src('./src/images/*.*')
        .pipe(changed('dist/images', {hasChanged: changed.compareSha1Digest}))
        .pipe(imageMin({
            progressive: true,// 无损压缩JPG图片
            svgoPlugins: [{removeViewBox: false}], // 不移除svg的viewbox属性
            use: [pngquant()] // 使用pngquant插件进行深度压缩
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch',function () {
    gulp.watch('src/js/*.js', ['script']);         //监控文件变化，自动更新
    gulp.watch('src/stylus/*.styl', ['stylus']);
    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/images/*.*', ['images']);
})

//启动热更新
gulp.task('serve', ['delete','watch'], function () {
    gulp.start('script', 'stylus', 'html', 'images');
    browserSync.init({
        port: 2017,
        server: {
            baseDir: ['dist']
        }
    });

});

gulp.task('default', ['serve']);



