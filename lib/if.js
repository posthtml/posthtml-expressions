const get = require('./get')
const locals = require('./local')

module.exports = function (local, style, exp) {
  const exps = locals(style, exp).replace('?', '').split(':')
  let condition

  function isDefined (element, index, array) {
    if (get(local, element) !== undefined) {
      return element
    }
  }

  exps.filter(isDefined).map(ex => {
    console.log(ex)
    condition = get(local, ex)
    console.log(condition)
  })

  return condition
}
