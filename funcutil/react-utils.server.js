const { readFileSync } = require('fs');
const path = require('path');
const { pipeToNodeWritable } = require('react-server-dom-webpack/writer');
const MemoryStream = require('memory-stream');

let moduleMapCache = null;
function getModuleMap() {
    if (moduleMapCache) {
        return moduleMapCache;
    }

    const manifest = readFileSync(
        path.resolve(__dirname, '../build/react-client-manifest.json'),
        'utf8'
    );
    const moduleMap = JSON.parse(manifest);

    moduleMapCache = new Proxy(moduleMap, {
        get: function (target, prop, receiver) {
            if (target[prop]) {
                return target[prop];
            }

            const bestKey = findBestMatchedKey(target, prop);
            if (bestKey) {
                return target[bestKey];
            }

            function findBestMatchedKey(target, prop) {
                const propChars = prop.split('');
                const scoredKeys = Object.keys(target)
                    .map(k => {
                        // compare strings from end and return number of matching characters
                        const keyChars = k.split('');

                        for (let i = 0; i < keyChars.length && i < propChars.length; i++) {
                            if (keyChars[keyChars.length - i - 1] !== propChars[propChars.length - i - 1]) {
                                return {
                                    key: k,
                                    matchedChars: i
                                };
                            }
                        }
                        return {
                            key: k,
                            matchedChars: 0
                        };
                    })
                    .sort((a, b) => b.matchedChars - a.matchedChars);

                if (scoredKeys.length && scoredKeys[0].matchedChars) {
                    return scoredKeys[0].key;
                }
            }
        }
    });
    return moduleMapCache;
}

function createResponseBody(reactElement) {
    return new Promise((resolve) => {
        const outputStream = new MemoryStream();
        outputStream.on('finish', () => resolve(outputStream.toString()));
        pipeToNodeWritable(reactElement, outputStream, getModuleMap());
    });
}

module.exports = {
    getModuleMap,
    createResponseBody,
};