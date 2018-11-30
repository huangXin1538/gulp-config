/**
 * @file gulp配置文件
 * @author huangxin
 */
var gulp = require('gulp'),
stylus = require('gulp-stylus'), //监测css
connect = require('gulp-connect'), //开启服务器
rev = require('gulp-rev'), //给文件加版本号
revCollector = require('gulp-rev-collector'), //替换html中文件名
minifyHTML = require('gulp-minify-html'),
runSequence = require('run-sequence'), //执行顺序
clean = require('gulp-clean'), //清空文件夹，避免文件冗余
cssmin = require('gulp-minify-css'),//压缩css文件
concat = require('gulp-concat'),   //合并文件
uglify = require('gulp-uglify'),   //js压缩
rename = require('gulp-rename'),   //文件重命名
// jshint = require('gulp-jshint'),   //js检查
notify = require('gulp-notify'),   //提示
spriter = require('gulp-css-spriter');   //提示
//本地assets目录开启服务器
gulp.task('connectDev', function () {
  connect.server({
    root: ['src', 'tmp'],
    port: 8000,
    livereload: true
  });
});
//编译后dist目录开启服务器
gulp.task('connectDist', function () {
  connect.server({
    root: 'dist',
    port: 8001,
    livereload: true
  });
});
//监测html变化
gulp.task('html', function () {
  gulp.src('./src/html/*.html')
    .pipe(connect.reload());
});
//监测css变化
gulp.task('stylus', function () {
  gulp.src('./src/stylus/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./src/css'))
    .pipe(connect.reload());
});
//集合监测
gulp.task('watch', function () {
  gulp.watch(['./src/html/*.html'], ['html']);
  gulp.watch(['./src/css/*.styl'], ['stylus']);
});
//给css/js文件添加版本号
gulp.task('rev', function () {
  return gulp.src(['rev/**/*.json', 'templates/**/*.html'])
      .pipe( revCollector({
          replaceReved: true,
          dirReplacements: {
              'css': '/dist/css/',
              'js/': '/dist/js/',
              'cdn/': function(manifest_value) {
                  return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
              }
          }
      }) )
      .pipe( minifyHTML({
              empty:true,
              spare:true
          }) )
      .pipe( gulp.dest('dist') );
});

gulp.task('clean', function(){
  return gulp.src(['dist', 'rev' ,'json'],{read: false})
      .pipe(clean());
});
gulp.task('cssV',function(){
  return gulp.src(['./src/css/*.css'])
          .pipe(rev()) //文件加入版本号
          .pipe(gulp.dest('dist/css'))
          .pipe(rev.manifest()) //对应的版本号和原始文件用json表示出来
          .pipe(gulp.dest('json'));
})
gulp.task('jsV',function(){
  return gulp.src(['./src/js/*.js'])
          .pipe(rev()) //文件加入版本号
          .pipe(gulp.dest('dist/js'))
          .pipe(rev.manifest()) //对应的版本号和原始文件用json表示出来
          .pipe(gulp.dest('json'));
})
gulp.task('dev',function(){
  return gulp.src(['json/rev-manifest.json','src/html/*.html'])
          .pipe(revCollector({
            replaceReved: true
          }))
          .pipe(gulp.dest('dist/html'));
})

gulp.task('version',function(){
  runSequence(
    'clean',
    'cssV',
    'jsV',
    'dev'
  );
});
//压缩css代码
gulp.task('minifycss',function(){
  return gulp.src('src/css/*.css')      //设置css
      .pipe(concat('order_query.css'))      //合并css文件到"order_query"
      .pipe(gulp.dest('min/css'))           //设置输出路径
      .pipe(rename({suffix:'.min'}))         //修改文件名
      .pipe(cssmin())                    //压缩文件
      .pipe(gulp.dest('min/css'))            //输出文件目录
      .pipe(notify({message:'css task ok'}));   //提示成功
});
//JS处理
gulp.task('minifyjs',function(){
   return gulp.src(['src/js/*.js'])  //选择合并的JS
       .pipe(concat('bundle.js'))   //合并js
       .pipe(gulp.dest('min/js'))        //输出
       .pipe(rename({suffix:'.min'}))     //重命名
       .pipe(uglify())                    //压缩
       .pipe(gulp.dest('min/js'))            //输出 
       .pipe(notify({message:"js task ok"}));    //提示
});

gulp.task('spriter', function() {
  return gulp.src('./css/*.css')
      .pipe(spriter({
          'spriteSheet': './dist/images/spritesheet.png', //雪碧图自动合成的图
          'pathToSpriteSheetFromCSS': '../images/spritesheet.png' //css引用的图片路径
      }))
      .pipe(gulp.dest('./dist/css')); //最后生成出来
});

//设置gulp命令功能（开启两个服务器、监测文件变化）
gulp.task('default', ['connectDist', 'connectDev', 'watch']);