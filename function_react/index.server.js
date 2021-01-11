require('../funcutil/babelregister.server');

const React = require('react');
const ReactApp = require('../src/App.server').default;
const { Pool } = require('pg');
const pool = new Pool(require('../credentials'));

const { createResponseBody } = require('../funcutil/react-utils.server');

const { decodeAuthInfo } = require('../funcutil/auth');

async function reactFunction(context, req) {
    return await createResponse(context, req);
}

async function notesPutFunction(context, req) {
    const userInfo = decodeAuthInfo(req);
    if (!userInfo) {
        return { status: 401 };
    }

    const now = new Date();
    const updatedId = Number(req.params.id);
    await pool.query(
        'update notes set title = $1, body = $2, updated_at = $3 where id = $4 and userid = $5',
        [req.body.title, req.body.body, now, updatedId, userInfo.userId]
    );
    return await createResponse(context, req);
}

async function notesPostFunction(context, req) {
    const userInfo = decodeAuthInfo(req);
    if (!userInfo) {
        return { status: 401 };
    }

    const now = new Date();
    const result = await pool.query(
        'insert into notes (title, body, created_at, updated_at, userid) values ($1, $2, $3, $3, $4) returning id',
        [req.body.title, req.body.body, now, userInfo.userId]
    );
    const insertedId = result.rows[0].id;
    return await createResponse(context, req, insertedId);
}

async function notesDeleteFunction(context, req) {
    const userInfo = decodeAuthInfo(req);
    if (!userInfo) {
        return { status: 401 };
    }

    await pool.query(
        'delete from notes where id = $1 and userid = $2',
        [req.params.id, userInfo.userId]);
    return await createResponse(context, req);
}

async function createResponse(context, req, redirectToId) {
    const location = JSON.parse(req.query.location);

    if (redirectToId) {
        location.selectedId = redirectToId;
    }

    const userInfo = decodeAuthInfo(req);

    const props = {
        userInfo,
        selectedId: location.selectedId,
        isEditing: location.isEditing,
        searchText: location.searchText,
    };

    if (userInfo) {
        context.log(JSON.stringify(userInfo, null, 2));
    }

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
    notesDeleteFunction,
    notesPostFunction,
    notesPutFunction,
};