const fieldAuth = require('@malijs/metadata-field-auth')

/**
 * Mali API key authorization metadata middleware.
 * If the call has metadata with "authorization" string property with "apikey <key>" then specified function is called
 * @module @malijs/apikey
 *
 * @param  {Options} options
 * @param  {String} options.keyField Optional key field within the authorization value to look for. Default: <code>"apikey"</code>
 * @param  {String|Object|Function} options.error optional Error creation options.
 *                                                If <code>String</code> the message for Error to throw in case
 *                                                authorization is not present.
 *                                                If <code>Object</code> the error options with <code>message</code>,
 *                                                <code>code</code>, and <code>metadata</code> properties. See <code>create-grpc-error</code>
 *                                                module.
 *                                                If <code>Function</code> a function with signature <code>(ctx)</code>
 *                                                called to create an error. Must return an <code>Error</code> instanse.
 *                                                Default: <code>"Not Authorized"</code>
 * @param  {Function} fn The middleware function to execute with signature <code>(key, ctx, next)</code>
 *
 * @example
 * const apikey = require('@malijs/apikey')
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

  let field = options.keyField
  if (!field || typeof field !== 'string') {
    field = 'apikey'
  }
  delete options.keyField

  return fieldAuth(field, options, fn)
}
