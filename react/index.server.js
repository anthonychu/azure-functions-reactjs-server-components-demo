require('../funcutil/babelregister');

const React = require('react');
const { pipeToNodeWritable } = require('react-server-dom-webpack/writer.node.server');
const ReactApp = require('../src/App.server').default;
const { readFileSync } = require('fs');
const path = require('path');

module.exports = async function (context, req) {
    const moduleMap = getModuleMap();
    const location = JSON.parse(req.query.location);

    const props = {
        selectedId: location.selectedId,
        isEditing: location.isEditing,
        searchText: location.searchText,
    };

    const writer = new Writer();
    return new Promise((resolve, reject) => {
        writer.on('done', (result) => resolve({
            status: 200,
            body: result,
            headers: { 'Content-Type': 'application/text', 'X-Location': JSON.stringify(props) }
        }));
        pipeToNodeWritable(React.createElement(ReactApp, props), writer, moduleMap);
    });
}

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
                            console.log(`${propChars[propChars.length - i - 1]} = ${keyChars[keyChars.length - i - 1]}`)
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

class Writer {
    constructor() {
        this.buffer = [];
        this.result;
        this.handlers = {}
    }
    write(s) {
        console.log(s.toString());
        this.buffer.push(s.toString())
        return true;
    }
    end(s) {
        if (s) {
            this.write(s);
        }
        console.log("DONE!!!!!")
        const handlers = this.handlers.done;
        if (handlers) {
            handlers.forEach((fn) => {
                fn(this.buffer.join(''))
            })
        }
    }
    on(event, fn) {
        const chain = this.handlers[event] = this.handlers[event] || []
        chain.push(fn)
    }
}