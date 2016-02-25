'use strict'

let get = require('./get')
let locals = require('./local')

exports = module.exports = function (local, style, exp) {
  let exps = locals(style, exp).split('|')

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
      // let test_slice = test.slice(-1)
      let result = exprs.concat(test)
      console.log(result)

      pipe += get(local, result) + ' '

      console.log(pipe)
    })
  }

  return pipe
}
