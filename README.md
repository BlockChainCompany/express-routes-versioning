# Express Versioned Routes

Simple node.js module provides versioning for expressjs routes/api.

## Install
`npm install BlockchainCompany/express-versioned-route`
will add to npm soon(tm)

## Usage

Follows semver versioning format. See https://github.com/npm/node-semver for more info.

```
    const app = require('express')();
    const VersionedRoute = require('express-versioned-route');
    app.listen(3000);

    app.get('/test', new VersionedRoute()
       .add('1.0.0', respondV1)
       .add('2.2.1', respondV2)
       .toMiddleware()
    );

    // curl -s -H 'accept-version: 1.0.0' localhost:3000/test
    // version 1.0.0 or 1.0 or 1 !
    function respondV1(req, res, next) {
       res.status(200).send('ok v1');
    }

    //curl -s -H 'accept-version: 2.2.0' localhost:3000/test
    //Anything from 2.2.0 to 2.2.9
    function respondV2(req, res, next) {
       res.status(200).send('ok v2');
    }
```

**API**

`new VersionedRoute(options)`

**Options** - object, containing version in semver format (supports ^,~ symbols) as key and function callback (connect middleware format) to invoke when the request matches the version as value. Note: Versions are expected to be mutually exclusive, as order of execution of the version couldn't be determined.

***header*** (optional) - Header to watch for: defaults to `Accept-Version`

***callbacks*** (optional) - A way to directly provide callbacks and their version.

***notFoundMiddleware*** (optional)- called if request version doesn't match the version provided in the options. If this callback is not provided latest version callback is called.

`.add(version : String, callback : Function) : VersionedRoute`

**version** - string, The version. you can not use any semver operators here. Those are only allowed in the header. `1.2.3`

**callback** - function, it's obvious isn't it? `(req, res, next) => {}`

`.toMiddleware() : Function`

Returns the middleware function


**How version is determined for each request ?**

Default behaviour is to use `accept-version` headers from the client.

This can be overridden by using a middleware and providing version in `req.version` property or setting the header option.

**How versions are matched ?**

semver versioning format is used to match version if versions are provided in semver format, supports ^,~ symbols on the client, else direct mapping is used (for versions like 1, 1.1)
If no version is found, the latest one is returned.

## Known Issues

If you define something like
```
    new VersionedRoute()
       .add('2.2.1', respondV1)
       .add('2.2.3', respondV2)
       .toMiddleware()
    );
```
and the client sends `Accept-Version: 2.2.2`, the latest version is returned.


## Examples

Examples are available [here](https://github.com/BlockChainCompany/express-versioned-route/tree/master/examples)

## Test
    (currently not working)
`npm test`
