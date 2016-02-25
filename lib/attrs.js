'use strict'

let get = require('./get')
let locals = require('./local')

exports = module.exports = function (local, style, exp) {
  let exps, attr

  if (!exp.includes('.')) {
    exps = locals(style, exp)
    attr = get(local, exps)
  }

  if (exp.includes('.')) {
    exps = locals(style, exp).split('.')
    attr = get(local, exps)
  }

  return attr
}
