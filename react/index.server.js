require('../funcutil/babelregister');

const React = require('react');
const {pipeToNodeWritable} = require('react-server-dom-webpack/writer.node.server');
const ReactApp = require('../src/App.server').default;
const {readFileSync} = require('fs');
const path = require('path');

module.exports = async function (context, req) {
    const manifest = readFileSync(
        path.resolve(__dirname, '../build/react-client-manifest.json'),
        'utf8'
    );
    const moduleMapOrig = JSON.parse(manifest);

    let moduleMap = moduleMapOrig;

    // override the entries of the manifest if it's not in the original folder
    if (process.env.REACT_MANIFEST_DIRECTORY) {
        moduleMap = {};
        for (const [key, value] of Object.entries(moduleMapOrig)) {
            const filenameMatch = /\/([^/]+)$/.exec(key);
            if (filenameMatch) {
                console.log(filenameMatch[1]);
                moduleMap[process.env.REACT_MANIFEST_DIRECTORY + filenameMatch[1]] = value;
            }
        }
        console.log(moduleMap);
    }

    const location = JSON.parse(req.query.location);

    const props = {
        selectedId: location.selectedId,
        isEditing: location.isEditing,
        searchText: location.searchText,
    };
    // const props = location;
context.log(props)
    const writer = new Writer();
    return new Promise((resolve, reject) => {
        writer.on('done', (result) => resolve({
            status: 200,
            body: result,
            headers: {'Content-Type': 'application/text', 'X-Location': JSON.stringify(props)}
        }));
        pipeToNodeWritable(React.createElement(ReactApp, props), writer, moduleMap);
    });
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
    end() {
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