const vm = require('vm')
const parseAndReplace = require('./parser')

let ctx, delimiters, unescapeDelimiters, delimiterRegex, unescapeDelimiterRegex, conditionals

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

  // conditional and loop options
  conditionals = options.conditionalTags || ['if', 'elseif', 'else']

  // kick off the parsing
  return walk.bind(null, options)
}

function walk (opts, nodes) {
  // After a conditional has been resolved, we remove the conditional elements
  // from the tree. This variable determines how many to skip afterwards.
  let skip

  // loop through each node in the tree
  return nodes.reduce((m, node, i) => {
    // if we're skipping this node, return immediately
    if (skip) { skip--; return m }

    // if we have a string, match and replace it
    if (typeof node !== 'object') {
      // if there are any matches, we parse and replace the results
      if (node.match(delimiterRegex) || node.match(unescapeDelimiterRegex)) {
        // TODO: this could be optimized by starting at the regex match index
        node = parseAndReplace(ctx, [delimiters, unescapeDelimiters], node)
      }
      m.push(node)
      return m
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

    // if we have an element matching "if", we've got a conditional
    // this comes after the recursion to correctly handle nested loops
    if (node.tag === conditionals[0]) {
      // throw an error if it's missing the "condition" attribute
      if (!(node.attrs && node.attrs.condition)) {
        throw new Error(`the "${conditionals[0]}" tag must have a "condition" attribute`)
      }

      // build the expression object, which we will turn into js and eval later
      const ast = [{
        statement: 'if',
        condition: node.attrs.condition,
        content: node.content
      }]

      // move through the nodes and collect all others that are part of the same
      // conditional statement
      let [current, nextTag] = getNextTag(nodes, ++i)
      while (conditionals.slice(-2).indexOf(nextTag.tag) > -1) {
        const obj = { statement: nextTag.tag, content: nextTag.content }

        // ensure the "else" tag is represented in our little AST as 'else',
        // even if a custom tag was used
        if (nextTag.tag === conditionals[2]) obj.statement = 'else'

        // add the condition if it's an else if
        if (nextTag.tag === conditionals[1]) {
          // throw an error if an "else if" is missing a condition
          if (!(nextTag.attrs && nextTag.attrs.condition)) {
            throw new Error(`the "${conditionals[1]}" tag must have a "condition" attribute`)
          }
          obj.condition = nextTag.attrs.condition

          // while we're here, expand "elseif" to "else if"
          obj.statement = 'else if'
        }
        ast.push(obj)

        ;[current, nextTag] = getNextTag(nodes, ++current)
      }

      // format into an expression
      const expression = ast.reduce((m2, e, i) => {
        m2 += e.statement
        if (e.condition) m2 += ` (${e.condition})`
        m2 += ` { ${i} } `
        return m2
      }, '')

      // evaluate the expression, get the winning node
      const expResult = ast[vm.runInContext(expression, ctx)].content

      // remove all of the conditional tags from the tree
      // we subtract 1 from i as it's incremented from the initial if statement
      // in order to get the next node
      skip = current - i
      m.push(...expResult)
      return m
      // nodes.splice(i - 1, current - i, ...expResult)
    }

    // return the modified node
    m.push(node)
    return m
  }, [])
}

function getNextTag (nodes, i, nodeCount) {
  // loop until we get the next tag (bypassing newlines etc)
  while (i < nodes.length) {
    const node = nodes[i]
    if (typeof node === 'object') {
      return [i, node]
    } else {
      i++
    }
  }
  return [i, { tag: undefined }]
}
