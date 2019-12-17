const {
  src,
  dest,
  parallel,
  watch
} = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();
const minifyCSS = require("gulp-clean-css");
const uglify = require("gulp-terser");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");
const htmlReplace = require("gulp-html-replace");
const htmlMin = require("gulp-htmlmin");

const config = {
  dist: "dist/",
  src: "src/",
  cssin: "src/css/**/*.css",
  jsin: "src/js/*.js",
  imgin: "src/assets/imgs/*.+(png|jpg)",
  htmlin: "src/*.html",
  scssin: "src/scss/*.scss",
  cssout: "dist/css/",
  jsout: "dist/js/",
  imgout: "dist/assets/imgs/",
  htmlout: "dist/",
  scssout: "src/css/",
  cssoutname: "styles.css",
  jsoutname: "scripts.js",
  cssreplaceout: "css/styles.css",
  jsreplaceout: "js/scripts.js"
};

function compileSCSS(cb) {
  watch(config.scssin, function () {
    return src(config.scssin)
      .pipe(sass())
      .pipe(autoprefixer())
      .pipe(dest(config.scssout));
  });
  cb();
}

function optimizeCSS() {
  return src(config.cssin)
    .pipe(minifyCSS())
    .pipe(dest(config.cssout));
}

function compileJS() {
  return src(config.jsin)
    .pipe(
      babel({
        presets: ["@babel/preset-env"]
      })
    )
    .pipe(uglify())
    .pipe(concat(config.jsoutname))
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(config.jsout));
}

function minifyImg(cb) {
  return src(config.imgin)
    .pipe(changed(config.imgout))
    .pipe(imagemin())
    .pipe(dest(config.imgout));
}

function compileHTML() {
  return src(config.htmlin)
    .pipe(
      htmlReplace({
        css: config.cssreplaceout,
        js: config.jsreplaceout
      })
    )
    .pipe(
      htmlMin({
        sortAttributes: true,
        sortClassName: true,
        collapseWhitespace: true
      })
    )
    .pipe(dest(config.dist));
}

function runServer(cb) {
  browserSync.init({
    server: {
      baseDir: config.src
    }
  });
  watch(config.htmlin).on("change", browserSync.reload);
  watch(config.cssout).on("change", browserSync.reload);
  cb();
}


exports.build = parallel(compileHTML, minifyImg, compileJS, optimizeCSS);


exports.default = parallel(
  runServer,
  compileSCSS
);