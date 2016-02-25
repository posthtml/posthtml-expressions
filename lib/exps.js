'use strict'

let get = require('./get')
let locals = require('./local')

exports = module.exports = function (local, style, exp, content) {
  let exps = exp.split(' ')

  function isExp (element, index, array) {
    if (element.match(/^{|{{|{%|@/)) {
      return element
    }
  }

  if (!exp.includes('.')) {
    exps.filter(isExp).forEach(ex => {
      content = content.replace(ex, get(local, locals(style, ex)))
    })
  }

  if (exp.includes('.')) {
    let exprs

    exps.filter(isExp).forEach(ex => {

      exprs = locals(style, ex).split('.')

      content = content.replace(ex, get(local, exprs))
    })
  }
  
  return content
}
