const register = require('react-server-dom-webpack/node-register');
register();
const babelRegister = require('@babel/register');
babelRegister({
    ignore: [
        /[\\\/](build|server|node_modules|functions)[\\\/]/,
        /[\\\/]index\.server\.js/
    ],
    presets: [['react-app', { runtime: 'automatic' }]],
    plugins: ['@babel/transform-modules-commonjs'],
    cache: false,
});