require('../funcutil/babelregister.server');

const React = require('react');
const ReactApp = require('../src/App.server').default;
const { Pool } = require('pg');
const pool = new Pool(require('../credentials'));

const { createResponseBody } = require('../funcutil/react-utils.server');

async function reactFunction(context, req) {
    return await createResponse(req);
}

async function notesPutFunction(context, req) {
    const now = new Date();
    const updatedId = Number(req.params.id);
    await pool.query(
        'update notes set title = $1, body = $2, updated_at = $3 where id = $4',
        [req.body.title, req.body.body, now, updatedId]
    );
    return await createResponse(req);
}

async function notesPostFunction(context, req) {
    const now = new Date();
    const result = await pool.query(
        'insert into notes (title, body, created_at, updated_at) values ($1, $2, $3, $3) returning id',
        [req.body.title, req.body.body, now]
    );
    const insertedId = result.rows[0].id;
    return await createResponse(req, insertedId);
}

async function createResponse(req, redirectToId) {
    const location = JSON.parse(req.query.location);

    if (redirectToId) {
        location.selectedId = redirectToId;
    }

    const props = {
        selectedId: location.selectedId,
        isEditing: location.isEditing,
        searchText: location.searchText,
    };

    const responseBody = await createResponseBody(React.createElement(ReactApp, props));
    return {
        body: responseBody,
        headers: {
            'X-Location': JSON.stringify(location),
            'Access-Control-Expose-Headers': 'X-Location'
        }
    };
}

module.exports = {
    reactFunction,
    notesPostFunction,
    notesPutFunction,
};