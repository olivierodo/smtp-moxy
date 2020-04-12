
module.exports = function (options) {
  const _cache = {}

  return {
    put (key, value, ttl) {
      _cache[key] = _cache[key] || []
      _cache[key].push(value)
    },
    get (key) {
      return _cache[key]
    },
    remove (key) {
      delete _cache[key]
    }
  }
}
