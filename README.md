# mali-apikey

Mali API key metadata authorization middleware

[![npm version](https://img.shields.io/npm/v/mali-apikey.svg?style=flat-square)](https://www.npmjs.com/package/mali-apikey)
[![build status](https://img.shields.io/travis/malijs/apikey/master.svg?style=flat-square)](https://travis-ci.org/malijs/apikey)

## API

<a name="module_mali-apikey"></a>

### mali-apikey
Mali API key authorization metadata middleware.
If the call has metadata with "authorization" string property with "apikey <key>" then specified function is called


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Options</code> |  |
| options.keyField | <code>String</code> | Optional key field within the authorization value to look for. Default: <code>"apikey"</code> |
| options.error | <code>String</code> | optional string for errors to throw in case authorization is not present                               Default: <code>"Not Authorized"</code> |
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
