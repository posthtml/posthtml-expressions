const vm = require('vm')
const merge = require('lodash.merge')
const cloneDeep = require('lodash.cloneDeep')
const parseAndReplace = require('./expression_parser')

let delimiters, unescapeDelimiters, delimiterRegex, unescapeDelimiterRegex, conditionals, loops

module.exports = function PostHTMLExpressions (options = {}) {
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
  loops = options.loopTags || ['each']

  // kick off the parsing
  return walk.bind(null, options)
}

function walk (opts, nodes) {
  // the context in which expressions are evaluated
  const ctx = vm.createContext(opts.locals)

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

    // if the node has content, recurse (unless it's a loop, handled later)
    if (node.content && node.tag !== 'each') {
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
      const expResult = ast[vm.runInContext(expression, ctx)]

      // remove all of the conditional tags from the tree
      // we subtract 1 from i as it's incremented from the initial if statement
      // in order to get the next node
      skip = current - i
      if (expResult) m.push(...expResult.content)
      return m
    }

    // parse loops
    if (node.tag === loops[0]) {
      if (!(node.attrs && node.attrs.loop)) {
        throw new Error(`the "${conditionals[1]}" tag must have a "loop" attribute`)
      }
      // parse the "loop" param
      const loopParams = parseLoopStatement(node.attrs.loop)
      const target = vm.runInContext(loopParams.expression, ctx)

      if (typeof target !== 'object') {
        throw new Error('You must provide an array or object to loop through')
      }

      if (loopParams.length < 1) {
        throw new Error('You must provide at least one loop argument')
      }

      if (Array.isArray(target)) {
        for (let index = 0; index < target.length; index++) {
          const value = target[index]
          // add value and optional index loop locals
          const scopedLocals = {}
          scopedLocals[loopParams.keys[0]] = value
          if (loopParams.keys[1]) scopedLocals[loopParams.keys[1]] = index
          // merge nondestructively into existing locals
          const scopedOptions = merge(opts, { locals: scopedLocals })
          // provide the modified options to the content evaluation
          // we need to clone the node because the normal operation modifies
          // the node directly
          const content = cloneDeep(node.content)
          const res = walk(scopedOptions, content)
          m.push(res)
        }
        return m
      } else {
        for (let key in target) {
          const value = target[key]
          // add item and optional index loop locals
          const scopedLocals = {}
          scopedLocals[loopParams.keys[0]] = key
          if (loopParams.keys[1]) scopedLocals[loopParams.keys[1]] = value
          // merge nondestructively into existing locals
          const scopedOptions = merge(opts, { locals: scopedLocals })
          // provide the modified options to the content evaluation
          // we need to clone the node because the normal operation modifies
          // the node directly
          const content = cloneDeep(node.content)
          const res = walk(scopedOptions, content)
          m.push(res)
        }
        return m
      }
    }

    // return the node
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

function parseLoopStatement (input) {
  let current = 0
  let char = input[current]

  // parse through keys `each **foo, bar** in x`, which is everything before
  // the word "in"
  const keys = []
  let key = ''
  while (!`${char}${lookahead(3)}`.match(/\sin\s/)) {
    key += char
    next()

    // if we hit a comma, we're on to the next key
    if (char === ',') {
      keys.push(key.trim())
      key = ''
      next()
    }

    // if we reach the end of the string without getting "in", it's an error
    if (typeof char === 'undefined') {
      throw new Error("Loop statement lacking 'in' keyword")
    }
  }
  keys.push(key.trim())

  // Bypass the word " in", and ensure there's a space after
  next(4)

  // the rest of the string is evaluated as the array/object to loop
  let expression = ''
  while (current < input.length) {
    expression += char
    next()
  }

  return {keys, expression}

  // Utility: Move to the next character in the parse
  function next (n = 1) {
    for (let i = 0; i < n; i++) { char = input[++current] }
  }

  // Utility: looks ahead n characters and returns the result
  function lookahead (n) {
    let counter = current
    const target = current + n
    let res = ''
    while (counter < target) {
      res += input[++counter]
    }
    return res
  }
}
