# Documen.ts

A TypeScript documentation viewer for use with [TypeDoc](https://github.com/TypeStrong/typedoc).

__ATTENTION__: This application is still under initial development.

## How to set up your documentation page

1. In this early stage of the project, you still have to **check out** this project and make changes to it.
2. In your own project root, execute this if you have `typedoc` globally installed (assuming your code is in the `src/` folder):
   ```bash
   typedoc --json reference.json --mode file src
   ```
   - You can use `jq -c` to minify the JSON.
   	 ```bash
   	 typedoc --json referenceRaw.json --mode file src
   	 jq -c '.' referenceRaw.json > reference.json
   	 rm referenceRaw.json
     ```
   - You can also use the `jq` script that comes with this repository to pre-filter some unused data in order to save even more space.  
     It includes filters for private and inherited members. If you don't want to filter these out, remove the respective filters from the script first.
   	 ```bash
   	 typedoc --json referenceRaw.json --mode file src
   	 jq -c -L path/to/this/repo/ 'import "filterDocs" as F; F::filterDocs' referenceRaw.json > reference.json
   	 rm referenceRaw.json
     ```
   - If you don't want to install `typedoc` globally, you can install it into your project as a `devDependency` and use `node_modules/.bin/typedoc` instead of `typedoc` on the command line.
3. Put the generated `reference.json` file into `src/Resources/data/` in this project.
4. Proceed according to what you want to do:
	- For development of this application, run `yarn && yarn run dev`. A [webpack-dev-server](https://github.com/webpack/webpack-dev-server) will start on port 3000.
	- For running this on a server with Node support, just put the whole contents of this directory on the server and execute `yarn && yarn build && yarn run server` on the server.
	An [express](https://github.com/expressjs/express) server will start on port 8080.  
	This has the benefit that a client does not need JavaScript enabled to show the documentation, as it uses [React server rendering](https://reactjs.org/docs/react-dom-server.html).
		- In both of the above cases, you can change the port the server runs on via the `PORT` environment variable.
	- If you don't need this benefit or don't have a server with Node support, run `yarn && yarn run build-client` and put the contents of the folder `build/client` on your server.  
	The build script assumes the files to be served at the document root of your domain.
