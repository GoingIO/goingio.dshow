/**
 * Created by telen on 10/13/15.
 */
fis.match('::packager', {
    spriter: fis.plugin('csssprites')
});

// fis.match('*', {
//   useHash: false
// });

fis.match('*.js', {
    optimizer: fis.plugin('uglify-js')
});

fis.match('*.css', {
    useSprite: true,
    optimizer: fis.plugin('clean-css')
});

fis.match('*.png', {
    optimizer: fis.plugin('png-compressor')
});

fis.match('*.{png,js,css}', {
    release: 'static/$0',
    useHash: true
});

fis.media('debug').match('*.{js,css,png}', {
    useHash: false,
    useSprite: false,
    optimizer: null
});