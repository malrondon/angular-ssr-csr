# Angular SSR and CSR

[![licence mit](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](http://hemersonvianna.mit-license.org/)
[![GitHub issues](https://img.shields.io/github/issues/malrondon/angular-ssr-csr.svg)](https://github.com/malrondon/angular-ssr-csr/issues)
![GitHub package.json version](https://img.shields.io/github/package-json/v/malrondon/angular-ssr-csr.svg)
![GitHub Release Date](https://img.shields.io/github/release-date/malrondon/angular-ssr-csr.svg)
![GitHub top language](https://img.shields.io/github/languages/top/malrondon/angular-ssr-csr.svg)
![GitHub repo size](https://img.shields.io/github/repo-size/malrondon/angular-ssr-csr.svg)
![GitHub All Releases](https://img.shields.io/github/downloads/malrondon/angular-ssr-csr/total.svg)

## Prerequisites

- [Node = v10.15.x](https://nodejs.org/en/)
- NPM >= v6.4.x
- [Yarn >= v1.13.0](https://yarnpkg.com/en/docs/install#linux-tab) or `npm install -g yarn`

### .gitconfig

Git's merge commit message

```bash
[alias]
  mergelogmsg = "!f() { var=$(git symbolic-ref --short HEAD) && printf 'Merge branch %s into %s\n\n::SUMMARY::\nBranch %s commits:\n' $1 $var $1 > temp_merge_msg && git log --format=format:'%s' $var..$1 >> temp_merge_msg && printf '\n\nBranch %s commits:\n' $var >> temp_merge_msg && git log --format=format:'%s' $1..$var >> temp_merge_msg && printf '\n\n* * * * * * * * * * * * * * * * * * * * * * * * *\n::DETAILS::\n' >> temp_merge_msg && git log --left-right $var...$1 >> temp_merge_msg && git merge --no-ff --no-commit $1 && git commit -eF temp_merge_msg; rm -f temp_merge_msg;}; f"
```

### Plans

- Angular 9
- `document is not defined` and `window is not defined` - [here](./defined.md)
- [Angular Material2](https://material.angular.io/) **UI components** - [individual branch](https://github.com/Angular-RU/angular-universal-starter/tree/material2)
- [Primeng](https://www.primefaces.org/primeng/) **UI components** - [individual branch] (https://github.com/Angular-RU/angular-universal-starter/tree/primeng)
- modules import depending on the platform (`MockServerBrowserModule`)
- execution of queries to api on the server `TransferHttp`
- work with cookies on the server `UniversalStorage`
- Uses **[ngx-meta](https://github.com/fulls1z3/ngx-meta)** for SEO (*title, meta tags, and Open Graph tags for social sharing*).
- uses ngx-translate to support internationalization (i18n)
- uses ORIGIN_URL - for absolute queries
- @angular/service-worker(`ng add @angular/pwa --project angular-ssr-csr`)

## How to start
- `yarn` or `npm install`
- `yarn start` or `npm run start` - for client rendering
- `yarn ssr` or `npm run ssr` - for server-side rendering
- `yarn build:universal` or `npm run build:universal` - for assembly in release
- `yarn server` or `npm run server` - to start the server
- `yarn build:prerender` or `npm run build:prerender` - to generate static by `static.paths.ts`
- for watch with ssr - `npm run ssr:watch`

## How to use this repository in your project:
To transfer ssr to your repository, you need the following files:
 - .angular-cli.json
 - server.ts
 - prerender.ts
 - webpack.config.js
 - main.server.ts
 - main.browser.ts
 - shared/*
 - forStorage/*
 - environments/*
 - app.browser.module.ts
 - app.server.module.ts

## References
Official example in English: https://github.com/angular/universal-starter
Modules used for universal:
- https://github.com/angular/universal/tree/master/modules/aspnetcore-engine - web for .net core
- https://github.com/angular/universal/tree/master/modules/common - TransferHttpCacheModule for http request only server side and sync with TransferHttp for browser
- https://github.com/angular/universal/tree/master/modules/express-engine - Express Engine to run the rendering in node, in our application is used. Please note that the current version is not lower than 5.0.0-beta.5
- https://github.com/angular/universal/tree/master/modules/hapi-engine - Hapi Engine is an alternative engine for rendering. In the example is not used, in principle in the connection scheme does not differ from express-engine
- https://github.com/angular/universal/tree/master/modules/module-map-ngfactory-loader - the module search module for LazyLoading - the thing needed and used. Please note that the current version is not lower than 5.0.0-beta.5

## Features (Important)
- The module for TransferHttp uses `import {TransferState} from '@angular/platform-browser';` and it is necessary to implement the request rest api on the server and the absence of the second request a second time. See `home.component.ts` (delay 3c)

```ts
this.http.get('https://reqres.in/api/users?delay=3').subscribe(result => {
    this.result = result;
});
```
- `export const AppRoutes = RouterModule.forRoot(routes, { initialNavigation: 'enabled' });`- so that there is no flashing of the page!

- to work with cookies, it is written `AppStorage`, which with DI allows you to give different implementations for the server and the browser. See `server.storage.ts` and `browser.storage.ts` for implementations. In `server.ts` there is

```ts
providers: [
    {
        provide: REQUEST, useValue: (req)
    },
    {
        provide: RESPONSE, useValue: (res)
    }
]
```
to work with REQUEST and RESPONSE via DI - this is necessary for implementing UniversalStorage when working with cookies.

- `webpack.config.js` is written exclusively for building server.ts file in server.js, since angular-cli has [bug](https: //github.com / angular/angular-cli/issues/7200) to work with 3d dependencies. - To solve some problems, use the following code in `server.ts` Solving the problems of global variables, including `document is not defined` and `window is not defined`
```ts
const domino = require('domino');
const fs = require('fs');
const path = require('path');
const template = fs.readFileSync(path.join(__dirname, '.', 'dist', 'index.html')).toString();
const win = domino.createWindow(template);
const files = fs.readdirSync(`${process.cwd()}/dist-server`);
// const styleFiles = files.filter(file => file.startsWith('styles'));
// const hashStyle = styleFiles[0].split('.')[1];
// const style = fs.readFileSync(path.join(__dirname, '.', 'dist-server', `styles.${hashStyle}.bundle.css`)).toString();

global['window'] = win;
Object.defineProperty(win.document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  },
});
global['document'] = win.document;
global['CSS'] = null;
// global['XMLHttpRequest'] = require('xmlhttprequest').XMLHttpRequest;
global['Prism'] = null;
```

```ts
  global['navigator'] = req['headers']['user-agent'];
```
this allows you to remove some of the problems when working with `undefined`.

## Create Tag

Current tag example: 1.0.0-beta.4

Command:

```bash
yarn release 1.0.0-beta.5
```

Questions and answers:

```sh
- ? Show updated files? `Yes`
- M  package.json

- ? Commit (Release 1.0.0-beta.5)? `Yes`
- ? Tag (1.0.0-beta.5)? `Yes`
- ? Push? `Yes`
- ? Publish "salles" to npm? `No`
```

## Log

Check [Releases](https://github.com/malrondon/angular-ssr-csr/releases) for detailed changelog.

## License

[MIT license](http://hemersonvianna.mit-license.org/) © Hemerson Vianna
