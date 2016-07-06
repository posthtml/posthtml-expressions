module.exports = function (options = {}) {

const attrs = require('./lib/attrs')
const exps = require('./lib/exps')
const pipe = require('./lib/pipe')
const each = require('./lib/each')
const partial = require('./lib/part')

  if (typeof options.locals === 'string') {
    options.locals = require(options.locals)
  }

  let style = options.style || '{{'
  let local = options.locals || {}

  return function PostHTMLExps (tree) {
    tree.walk((node) => {
      const attributes = node.attrs || {}
      const content = node.content || []

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
