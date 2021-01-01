require('../funcutil/babelregister');

const React = require('react');
const ReactApp = require('../src/App.server').default;

const { createResponseBody } = require('../funcutil/react-utils.server');

async function reactFunction (context, req) {
    const location = JSON.parse(req.query.location);

    const props = {
        selectedId: location.selectedId,
        isEditing: location.isEditing,
        searchText: location.searchText,
    };

    const responseBody = await createResponseBody(React.createElement(ReactApp, props));
    return {
        body: responseBody,
        headers: {
            'X-Location': JSON.stringify(props)
        }
    };
}

async function notesFunction (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const name = (req.query.name || (req.body && req.body.name));
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

    return {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}

module.exports = {
    reactFunction,
    notesFunction,
};