require('../funcutil/babelregister');

const React = require('react');
const ReactApp = require('../src/App.server').default;

const { createResponseBody } = require('../funcutil/react-utils.server');

module.exports = async function (context, req) {
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
