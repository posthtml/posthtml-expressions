// ------------------------------------
// #POSTHTML - EXPS
// ------------------------------------

'use strict'

let get = require('./lib/get')
let locals = require('./lib/local')

let attrs = require('./lib/attrs')
let exps = require('./lib/exps')
let pipe = require('./lib/pipe')
let each = require('./lib/each')
let partial = require('./lib/part')
// let condition = require('./lib/if')

exports = module.exports = function (options) {
  options = options || {}

  if (typeof options.locals === 'string') {
    options.locals = require(options.locals)
  }

  let style = options.style || '{'
  let local = options.locals || {}

  return function PostHTMLExps (tree) {
    tree.walk((node) => {
      let attributes = node.attrs || {}
      let content = node.content || []

      let exp

      Object.keys(attributes).forEach(attr => {
        exp = attributes[attr]

        if (exp.includes(style)) {

          if (!exp.includes('.')) {
            node.attrs[attr] = attrs(local, style, exp)
          }

          if (exp.includes('.')) {
            node.attrs[attr] = attrs(local, style, exp)
          }
        }

      })

      if (content.length === 1) {
        if (typeof content[0] === 'string') {

          exp = content[0].trim()

          if (content[0].includes(exp)) {

            if (!exp.includes('.')) {

              if (exp.includes(`${style}`) ||
                  exp.includes(` ${style}`) &&
                 !exp.includes(`>`) &&
                 !exp.includes('|') &&
                 !exp.includes('?') &&
                 !exp.includes('...')
               ) {
                node.content = exps(local, style, exp, node.content[0])
              }

              // if (exp.includes('?')) {
              //   node.content = condition(local, style, exp)
              // }

              if (exp.includes('|')) {
                node.content = pipe(local, style, exp).trim()
              }

              if (exp.includes('> ') || exp.includes(' > ')) {
                node.content = partial(local, style, exp).trim() + '\n  '
              }

              if (exp.includes('...')) {
                return each(node, local, style, exp)
              }
            }

            if (exp.includes('.')) {

              if (exp.includes(`${style}`) &&
                !exp.includes(`|`) &&
                !exp.includes(`>`) &&
                !exp.includes(`...`)
              ) {

                node.content = exps(local, style, exp, node.content[0])
              }

              if (exp.includes('|')) {
                node.content = pipe(local, style, exp).trim()
              }

              if (exp.includes(`> `)) {
                node.content = partial(local, style, exp).trim() + '\n  '
              }

              if (exp.includes('...')) {
                return each(node, local, style, exp)
              }
            }
          }
        }
      }
      return node
    })
    return tree
  }
}
