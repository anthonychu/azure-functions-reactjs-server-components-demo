"use strict";

// https://github.com/anthonychu/swa-api/blob/main/dist/auth.js


function decodeAuthInfo(req) {
    if (!req)
        return;
    // This block sets a development user that has rights to upload
    // TODO: find a better way to do this
    if (process.env.FUNCTIONS_CORETOOLS_ENVIRONMENT) {
        return {
            identityProvider: "github",
            userId: "17baeed9bn1sa3e5dbs24283",
            userDetails: "testuser",
            userRoles: ["admin", "anonymous", "authenticated"],
        };
    }
    var clientPrincipalHeader = "x-ms-client-principal";
    if (req.headers[clientPrincipalHeader] == null) {
        return;
    }
    var buffer = Buffer.from(req.headers[clientPrincipalHeader], "base64");
    var serializedJson = buffer.toString("ascii");
    return JSON.parse(serializedJson);
}

module.exports = {
  decodeAuthInfo
};