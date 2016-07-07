const vm = require('vm')
const parseAndReplace = require('./parser')

let ctx, delimiters, unescapeDelimiters, delimiterRegex, unescapeDelimiterRegex

module.exports = function PostHTMLExpressions (options = {}) {
  // the context in which expressions are evaluated
  ctx = vm.createContext(options.locals)

  // set up delimiter options and detection
  delimiters = options.delimiters || ['{{', '}}']
  unescapeDelimiters = options.unescapeDelimiters || ['{{{', '}}}']
  delimiterRegex = new RegExp(`.*${delimiters[0]}(.*)${delimiters[1]}.*`, 'g')
  unescapeDelimiterRegex = new RegExp(`.*${unescapeDelimiters[0]}(.*)${unescapeDelimiters[1]}.*`, 'g')

  // identification for delimiter options, for the parser
  delimiters.push('escaped')
  unescapeDelimiters.push('unescaped')

  // kick off the parsing
  return walk.bind(null, options)
}

function walk (opts, nodes) {
  // loop through each node in the tree
  return nodes.map((node) => {
    // if we have a string, match and replace it
    if (typeof node !== 'object') {
      // if there are any matches, we parse and replace the results
      if (node.match(delimiterRegex) || node.match(unescapeDelimiterRegex)) {
        // TODO: this could be optimized by starting at the regex match index
        node = parseAndReplace(ctx, [delimiters, unescapeDelimiters], node)
      }
      return node
    }

    // if not, we have an object, so we need to run the attributes and contents
    if (node.attrs) {
      for (let key in node.attrs) {
        const val = node.attrs[key]
        if (val.match(delimiterRegex)) {
          node.attrs[key] = parseAndReplace(ctx, [delimiters, unescapeDelimiters], val)
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
