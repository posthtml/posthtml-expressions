const get = require('./get')
const locals = require('./local')

module.exports = function (local, style, exp) {
  const exps = locals(style, exp).split('|')
  let pipe = ''

  if (!exp.includes('.')) {
    exps.forEach(ex => {
      pipe += get(local, ex) + ' '
    })
  }

  if (exp.includes('.')) {
    let exprs

    exprs = exps.shift().split('.')
    console.log(exprs)
    exps.forEach(ex => {
      let test = []

      test.push(ex)
      console.log(test)
      let result = exprs.concat(test)
      console.log(result)

      pipe += get(local, result) + ' '

      console.log(pipe)
    })
  }

  return pipe
}
