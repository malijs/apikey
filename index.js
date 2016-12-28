const auth = require('mali-metadata-auth')

/**
 * Mali API key authorization metadata middleware.
 * If the call has metadata with "authorization" string property with "apikey <key>" then specified function is called
 * @module mali-bearer
 *
 * @param  {Options} options
 * @param  {String} options.keyField Optional key field within the authorization value to look for. Default: <code>"apikey"</code>
 * @param  {String} options.error optional string for errors to throw in case authorization is not present
 *                               Default: <code>"Not Authorized"</code>
 * @param  {Function} fn The middleware function to execute with signature <code>(key, ctx, next)</code>
 *
 * @example
 * const apikey = require('mali-apikey')
 *
 * app.use(apikey(async (key, ctx, next) => {
 *   console.log(key)
 *   await next()
 * })
 */
module.exports = function (options, fn) {
  if (typeof options === 'function') {
    fn = options
    options = {}
  }

  if (typeof options.error !== 'string' || !options.error) {
    options.error = 'Not Authorized'
  }

  if (typeof options.keyField !== 'string' || !options.keyField) {
    options.keyField = 'apikey'
  }

  return auth(options, (authorization, ctx, next) => {
    if (!authorization) throw new Error(options.error)

    const parts = authorization.split(' ')
    if (parts.length !== 2) throw new Error(options.error)

    const scheme = parts[0]
    const credentials = parts[1]

    let key
    const rstr = String.raw`^${options.keyField}$`
    if (new RegExp(rstr, 'i').test(scheme)) {
      key = credentials
    }

    if (!key) throw new Error(options.error)

    return fn(key, ctx, next)
  })
}
