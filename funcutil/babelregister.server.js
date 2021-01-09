try {
    const register = require('react-server-dom-webpack/node-register');
    register();
    const babelRegister = require('@babel/register');
    babelRegister({
        ignore: [
            // ignore build except if preceeded by react-static-web-apps-auth/ (reference to my local package)
            // ignore node_modules except if followed by react-static-web-apps-auth
            /[\\\/]((?<!react-static-web-apps-auth[\\\/])build|server|node_modules(?![\\\/].+[\\\/]react-static-web-apps-auth)|functions)[\\\/]/,
            /[\\\/]index\.server\.js/,
            /[\\\/]worker-bundle\.js/,
        ],
        presets: [['react-app', { runtime: 'automatic' }]],
        plugins: ['@babel/transform-modules-commonjs'],
        cache: false,
    });
    require('react-fs');
} catch (err) {
    console.error(err);
    // force a restart of the functions Node.js worker
    // --conditions might not be set on the worker if a placeholder is being used
    // hopefully restarting it will pick that up
    if (process.env.languageWorkers__node__arguments) {
        console.log("\n\n\n>>>>>> exiting\n\n\n");
        process.exit(1);
    }
}