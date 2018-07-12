var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var babel = require('gulp-babel');


function minimiza_css() {
    gulp.src('styles.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('./dist/'));
}


//Tarea que minimiza CSSs sin esperar a que se actualice la versión
gulp.task('styles', function () {
    minimiza_css();
});



gulp.task('deploy-js', function () {
    gulp.src([
                "vendor/delaunay.js",
                "vendor/three.js",
                "vendor/three.js.CopyShader.js",
                "vendor/three.js.EdgeShader.js",
                "vendor/three.js.EffectComposer.js",
                "vendor/three.js.MaskPass.js",
                "vendor/three.js.RenderPass.js",
                "vendor/three.js.ShaderPass.js",
                "src/js/GlRenderer_repo.js"])
                
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['styles', 'deploy-js']);
