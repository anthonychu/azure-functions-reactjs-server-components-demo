try {
    const register = require('react-server-dom-webpack/node-register');
    register();
    const babelRegister = require('@babel/register');
    babelRegister({
        ignore: [
            /[\\\/](build|server|node_modules|functions)[\\\/]/,
            /[\\\/]index\.server\.js/,
            /[\\\/]worker-bundle\.js/,
        ],
        presets: [['react-app', { runtime: 'automatic' }]],
        plugins: ['@babel/transform-modules-commonjs'],
        cache: false,
    });
    require('react-fs');
} catch {
    // force a restart of the function host
    // --conditions might not be set on the worker if a placeholder is being used
    // hopefully restarting it will pick that up
    console.log("\n\n\n>>>>>> exiting\n\n\n");
    process.exit(1);
}