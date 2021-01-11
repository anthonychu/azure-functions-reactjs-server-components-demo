# React Server Components Demo - Azure Static Web Apps

This is a port of the [React Server Components "React Notes"](https://github.com/reactjs/server-components-demo) demo for Azure Static Web Apps. React Server Components is currently an experimental project, and the code here to make it work in Azure is equally experimental. For demonstration purposes only!

**Live demo: https://react-notes.anthonychu.com/**

Azure services used:
- Azure Static Web Apps (and Azure Functions)
- Azure Database for PostgreSQL - Flexible Server

[Original README](README.orig.md)

## Run locally

1. Fork and clone this repo.

1. Start an instance of Postgres locally with the demo's default credentials. Docker works great:
    ```bash
    docker run --name react-notes -p 5432:5432 -e POSTGRES_USER=notesadmin -e POSTGRES_PASSWORD=password -d postgres
    ```

1. Install Azure Functions Core Tools.
    ```bash
    npm i -g azure-functions-core-tools@3 --unsafe-perm true
    ```

1. Update `src/config.js` to use local Azure Functions URL:
    ```js
    module.exports = {
      apiBaseUrl: '/api'
    };
    ```

1. Build the app.
    ```bash
    npm install
    npm run build
    ```

1. Start the Azure Functions app.
    ```bash
    func start
    ```

1. Serve the frontend with a web server. Using Python here but anything works.
    ```bash
    python -m http.server
    ```

## Deploy to Azure

1. Create a Postgres Database in Azure
    - [Azure Database for PostgreSQL - Flexible Server](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/quickstart-create-server-portal) recommended
    - Cheapest one works great

1. Seed database
    - Set `DB_HOST`, `DB_USER`, and `DB_PASSWORD` environment variables to match how you configured your Azure Postgres instance
    - Run `npm run seed`

1. Create an Azure Static Web App
    - App location: `build`
    - API location: `/`
    - Artifact (output) location: (leave blank)

1. The workflow needs to be modified to build the app properly. Add an Action to the generated workflow:
    ```yaml
    - name: Build app and API
      run: | # build and then remove package.json (so deploy step doesn't reinstall modules)
        npm install
        npm run build
        npm prune --production
        rm package.json package-lock.json
        ls -la build
    ```
    Save and push the file to trigger another deployment. See [this file](.github/workflows/azure-static-web-apps-kind-wave-0f8b93b1e.yaml) for an example.

1. In the Azure portal, go to the Static Web App and open *Configuration*. Enter the following settings:
    | name | value |
    | --- | --- |
    | `BABEL_DISABLE_CACHE` | `1` |
    | `DB_HOST` | `<server_name>.postgres.database.azure.com` |
    | `DB_USER` | your database username |
    | `DB_PASSWORD` | your database password |
    | `DB_SSL` | `1` |
    | `languageWorkers__node__arguments` | `--conditions=react-server` |
    | `NODE_ENV` | `production` |

1. Save the settings. It may take a few seconds to take effect. If all goes well, go to the app's URL and you should see the app.

## How does this work?

🚨 While it is fully functional, this is entirely experimental and for demonstration purposes only. Do not use for anything resembling production.

A few changes were made to the demo app to work better in Azure.

- Some React Server Components originally called a local HTTP endpoint. When it's running in Azure Functions, it's not advisible to make HTTP calls to itself. Those calls were converted to direct Postgres queries.
- Some changes to the WebPack fonfig `scripts/build.js` to combine the contents of `build` and `publish` folders.
- Changed Postgres config to enable SSL when calling an Azure database.

### Changes for Azure Functions / Static Web Apps

- An HTTP function was created for every endpoint in the original demo. The functions themselves are all in `function_react/index.server.js`.
- The function filename must end in `.server.js` to satisfy React Server Components conventions.
- While Azure Functions supports Node.js 14, the version of Node.js currently available in Static Web Apps is 12. The demo app uses `fs/promises`, which is only in Node.js 14. Added a shim at `fs/promises.js` to get around this.
- The demo requires the `--conditions` flag to be set in the Node.js process. This flag is set with `languageWorkers__node__arguments` app setting. Because Azure Functions starts the Node worker process before your app is loaded, you typically need to set an extra app setting (`WEBSITE_USE_PLACEHOLDER=0`) to delay the start of the worker process. However, function apps in Static Web Apps are not allowed to configure app settings starting with `WEBSITE_`. To get around this, if the `conditions` flag isn't set, there is code in `funcutil/babelregister.server.js` to cause a restart in the Node process. This is a huge hack and should never be used in a production app!
- The `pipeToNodeWritable` function in React Server Components requires writing to a stream. Like some other serverless platforms, Azure Functions is unable to stream responses. We use a `memory-stream` for this.
- `pipeToNodeWritable` looks up client components in a generated manifest. Because the manifest contains full paths from the build machine that are different than the paths in the Azure Functions environment, we use a proxy to select the file with the nearest matching name. See `funcutil/react-utils.server.js`.
- Authentication was added to the app to allow only logged in users to view and modify their own notes.