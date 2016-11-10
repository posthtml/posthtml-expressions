const vm = require('vm')
const merge = require('lodash.merge')
const cloneDeep = require('lodash.clonedeep')
const parseAndReplace = require('./expression_parser')

let delimiters, unescapeDelimiters, delimiterRegex, unescapeDelimiterRegex, conditionals, loops, scopes, options

module.exports = function PostHTMLExpressions (_options = {}) {
  options = _options
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
  scopes = options.scopeTags || ['scope']
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
    if (node.content && node.tag !== loops[0] && node.tag !== scopes[0]) {
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
      // handle syntax error
      if (!(node.attrs && node.attrs.loop)) {
        throw new Error(`the "${conditionals[1]}" tag must have a "loop" attribute`)
      }

      // parse the "loop" param
      const loopParams = parseLoopStatement(node.attrs.loop)
      const target = vm.runInContext(loopParams.expression, ctx)

      // handle additional syntax errors
      if (typeof target !== 'object') {
        throw new Error('You must provide an array or object to loop through')
      }

      if (loopParams.keys.length < 1 || loopParams.keys[0] === '') {
        throw new Error('You must provide at least one loop argument')
      }

      // run the loop, different types of loops for arrays and objects
      if (Array.isArray(target)) {
        for (let index = 0; index < target.length; index++) {
          m.push(executeLoop(loopParams.keys, target[index], index, node))
        }
      } else {
        for (let key in target) {
          m.push(executeLoop(loopParams.keys, target[key], key, node))
        }
      }

      // return directly out of the loop, which will skip the "each" tag
      return m
    }

    // parse scopes
    if (node.tag === scopes[0]) {
      console.log('scopes found')
      // handle syntax error
      if (!(node.attrs && node.attrs.with)) {
        throw new Error(`the "${scopes[0]}" tag must have a "with" attribute`)
      }

      const target = vm.runInContext(node.attrs.with, ctx)

      // handle additional syntax errors
      if (typeof target !== 'object' || Array.isArray(target)) {
        throw new Error('You must provide an object to make scope')
      }

      m.push(executeScoped(target, node))

      // return directly out of the loop, which will skip the "each" tag
      return m
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

/**
 * Given a "loop" parameter from an "each" tag, parses out the param names and
 * expression to be looped through using a mini text parser.
 */
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

/**
 * Creates a set of local variables within the loop, and evaluates all nodes
 * within the loop, returning their contents
 */
function executeLoop (loopParams, p1, p2, node) {
  // two loop locals are allowed
  // - for arrays it's the current value and the index
  // - for objects, it's the value and the key
  const scopedLocals = {}
  scopedLocals[loopParams[0]] = p1
  if (loopParams[1]) scopedLocals[loopParams[1]] = p2

  return executeScoped(scopedLocals, node)
}

/**
 * Runs walk function with arbitrary set of local variables
 */
function executeScoped (scopedLocals, node) {
  // merge nondestructively into existing locals
  const scopedOptions = merge(cloneDeep(options), { locals: scopedLocals })
  // walk through the contents and run replacements with modified options
  // we need to clone the node because the normal operation modifies
  // the node directly
  return walk(scopedOptions, cloneDeep(node.content))
}

