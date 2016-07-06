const get = require('./get')
const locals = require('./local')

module.exports = function (node, local, style, exp) {
  let exps = locals(style, exp).replace('... ', '').trim()

  let nodes = []

  if (!exp.includes('.')) {
    for (let i = 0; i < get(local, exps).length; i++) {
      if (typeof get(local, exps)[i] === 'object') {
        Object.keys(get(local, exps)[i]).forEach(key => {
          node.content = get(local, exps)[i][key]
          nodes.push('  ', Object.assign({}, node), '\n  ')
        })
      }

      if (typeof get(local, exps)[i] === 'string') {
        node.content = get(local, exps)[i]
        nodes.push('  ', Object.assign({}, node), '\n  ')
      }
    }
  }

  if (exp.includes('.')) {
    exps = locals(style, exp).replace('...', '').trim().split('.')

    for (let i = 0; i < get(local, exps).length; i++) {
      if (typeof get(local, exps)[i] === 'object') {
        Object.keys(get(local, exps)[i]).forEach(key => {
          node.content = get(local, exps)[i][key]
          nodes.push('  ', Object.assign({}, node), '\n  ')
        })
      }

      if (typeof get(local, exps)[i] === 'string') {
        node.content = get(local, exps)[i]
        nodes.push('  ', Object.assign({}, node), '\n  ')
      }
    }
  }

  nodes.pop()
  nodes.shift()

  return nodes
}
