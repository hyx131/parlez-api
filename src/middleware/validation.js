const hasParams = (paramObj) => (...params) => (req, _, next) => {
  for (const param of params) {
    if (!req[paramObj][param]) {
      return next(new Error(`Missing ${param} in ${paramObj}`)) // TODO: custom error handler
    }
  }
  return next()
}

module.exports.hasQueryParams = hasParams('query')
module.exports.hasBodyParams = hasParams('body')
