# vue-widget

Connect to the 4C Widget using the following configuration in debug mode (while running `npm run serve`).

Advanced Settings: Additional Plugins

```
http://localhost:8080/js/chunk-vendors.js
http://localhost:8080/js/app.js
```

Or the full URL to the hosted file for production

You may also make a PR for the main project by adding the `editor` and
`runtime` parts of `standard-plugins.json`. E.g.

```javascript
{
    "editor": ["http://localhost:8080/js/chunk-vendors.js", "http://localhost:8080/js/app.js"],
    "runtime": ["http://localhost:8080/js/chunk-vendors.js", "http://localhost:8080/js/app.js"]
}
```

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
