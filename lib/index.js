const vm = require('vm')
const parseAndReplace = require('./parser')

let ctx, delimiters, delimiterRegex

module.exports = function PostHTMLExpressions (options = {}) {
  ctx = vm.createContext(options.locals)
  delimiters = options.delimiters || ['{{', '}}']
  delimiterRegex = new RegExp(`.*${delimiters[0]}(.*)${delimiters[1]}.*`, 'g')

  return walk.bind(null, options)
}

function walk (opts, nodes) {
  // loop through each node in the tree
  return nodes.map((node) => {
    // if we have a string, match and replace it
    if (typeof node !== 'object') {
      // if there are any matches, we parse and replace the results
      if (node.match(delimiterRegex)) {
        node = parseAndReplace(ctx, delimiters, node)
      }
      return node
    }

    // if not, we have an object, so we need to run the attributes and contents
    if (node.attrs) {
      for (let key in node.attrs) {
        const val = node.attrs[key]
        if (val.match(delimiterRegex)) {
          node.attrs[key] = parseAndReplace(ctx, delimiters, val)
        }
      }
    }

    // if the node has content, recurse
    if (node.content) {
      node.content = walk(opts, node.content)
    }

    // return the modified node
    return node
  })
}
