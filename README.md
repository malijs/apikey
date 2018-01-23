# mali-apikey

Mali API key metadata authorization middleware

[![npm version](https://img.shields.io/npm/v/mali-apikey.svg?style=flat-square)](https://www.npmjs.com/package/mali-apikey)
[![build status](https://img.shields.io/travis/malijs/apikey/master.svg?style=flat-square)](https://travis-ci.org/malijs/apikey)
[![Greenkeeper badge](https://badges.greenkeeper.io/malijs/apikey.svg)](https://greenkeeper.io/)

## API

<a name="module_mali-apikey"></a>

### mali-apikey
Mali API key authorization metadata middleware.
If the call has metadata with "authorization" string property with "apikey <key>" then specified function is called


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Options</code> |  |
| options.keyField | <code>String</code> | Optional key field within the authorization value to look for. Default: <code>"apikey"</code> |
| options.error | <code>String</code> \| <code>Object</code> \| <code>function</code> | optional Error creation options.                                                If <code>String</code> the message for Error to throw in case                                                authorization is not present.                                                If <code>Object</code> the error options with <code>message</code>,                                                <code>code</code>, and <code>metadata</code> properties. See <code>create-grpc-error</code>                                                module.                                                If <code>Function</code> a function with signature <code>(ctx)</code>                                                called to create an error. Must return an <code>Error</code> instanse.                                                Default: <code>"Not Authorized"</code> |
| fn | <code>function</code> | The middleware function to execute with signature <code>(key, ctx, next)</code> |

**Example**  

```js
const apikey = require('mali-apikey')

app.use(apikey(async (key, ctx, next) => {
  console.log(key)
  await next()
})
```

## License

  Apache-2.0
