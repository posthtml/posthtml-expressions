'use strict'

let fs = require('fs')
let get = require('./get')
let locals = require('./local')

exports = module.exports = function (local, style, exp) {
  let exps = exp.replace('> ', '').split(' ')

  let exprs, replace, partial

  function isExp (element, index, array) {
    if (element.match(/^{|{{|{%|@/)) {
      return element
    }
  }

  if (!exp.includes('.')) {
    exps.filter(isExp).forEach(ex => {
      exprs = locals(style, ex).replace('> ', '')

      replace = ex.replace(`${style}`, `${style}> `)

      partial = fs.readFileSync(get(local, locals(style, exprs)), 'utf8')

      partial = exp.replace(replace, partial)
    })
  }

  if (exp.includes('.')) {
    exps.filter(isExp).forEach(ex => {
      replace = ex.replace(`${style}`, `${style}> `)

      exprs = locals(style, ex).replace('>', '').split('.')

      partial = fs.readFileSync(get(local, exprs), 'utf8').trim()

      partial = exp.replace(replace, partial)
    })
  }

  return partial
}
