'use strict'

const vm = require('vm')
const cloneDeep = require('fclone')
const placeholders = require('./placeholders')

let delimitersSettings = []
let conditionals, loops, scopes

const matchOperatorsRegexp = /[|\\{}()[\]^$+*?.]/g

function escapeRegexpString (input) {
  return input.replace(matchOperatorsRegexp, '\\$&')
}

module.exports = function PostHTMLExpressions (options) {
  // set default options
  options = Object.assign({
    delimiters: ['{{', '}}'],
    unescapeDelimiters: ['{{{', '}}}'],
    conditionalTags: ['if', 'elseif', 'else'],
    loopTags: ['each'],
    scopeTags: ['scope'],
    locals: {}
  }, options)

  // set tags
  loops = options.loopTags
  scopes = options.scopeTags
  conditionals = options.conditionalTags

  // make a RegExp's to search for placeholders
  let before = escapeRegexpString(options.delimiters[0])
  let after = escapeRegexpString(options.delimiters[1])
  const delimitersRegexp = new RegExp(`${before}(.+?)${after}`, 'g')

  before = escapeRegexpString(options.unescapeDelimiters[0])
  after = escapeRegexpString(options.unescapeDelimiters[1])
  const unescapeDelimitersRegexp = new RegExp(`${before}(.+?)${after}`, 'g')

  // make array of delimiters
  const delimiters = [
    { text: options.delimiters, regexp: delimitersRegexp, escape: true },
    { text: options.unescapeDelimiters, regexp: unescapeDelimitersRegexp, escape: false }
  ]

  // we arrange delimiter search order by length, since it's possible that one
  // delimiter could 'contain' another delimiter, like '{{' and '{{{'. But if
  // you sort by length, the longer one will always match first.
  if (options.delimiters.join().length > options.unescapeDelimiters.join().length) {
    delimitersSettings[0] = delimiters[0]
    delimitersSettings[1] = delimiters[1]
  } else {
    delimitersSettings[0] = delimiters[1]
    delimitersSettings[1] = delimiters[0]
  }

  // kick off the parsing
  return walk.bind(null, { locals: options.locals })
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
    if (typeof node === 'string') {
      node = placeholders(node, ctx, delimitersSettings)
      m.push(node)
      return m
    }

    // if not, we have an object, so we need to run the attributes and contents
    if (node.attrs) {
      for (let key in node.attrs) {
        node.attrs[key] = placeholders(node.attrs[key], ctx, delimitersSettings)
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

      // сalculate the first path of condition expression
      let expressionIndex = 1
      let expression = `if (${node.attrs.condition}) { 0 } `
      const branches = [node.content]

      // move through the nodes and collect all others that are part of the same
      // conditional statement
      let computedNextTag = getNextTag(nodes, ++i)
      let current = computedNextTag[0]
      let nextTag = computedNextTag[1]

      while (conditionals.slice(1).indexOf(nextTag.tag) > -1) {
        let statement = nextTag.tag
        let condition = ''

        // ensure the "else" tag is represented in our little AST as 'else',
        // even if a custom tag was used
        if (nextTag.tag === conditionals[2]) statement = 'else'

        // add the condition if it's an else if
        if (nextTag.tag === conditionals[1]) {
          // throw an error if an "else if" is missing a condition
          if (!(nextTag.attrs && nextTag.attrs.condition)) {
            throw new Error(`the "${conditionals[1]}" tag must have a "condition" attribute`)
          }
          condition = nextTag.attrs.condition

          // while we're here, expand "elseif" to "else if"
          statement = 'else if'
        }
        branches.push(nextTag.content)

        // calculate next part of condition expression
        expression += statement + (condition ? ` (${condition})` : '') + ` { ${expressionIndex++} } `

        computedNextTag = getNextTag(nodes, ++current)
        current = computedNextTag[0]
        nextTag = computedNextTag[1]
      }

      // evaluate the expression, get the winning condition branch
      const branch = branches[vm.runInContext(expression, ctx)]

      // remove all of the conditional tags from the tree
      // we subtract 1 from i as it's incremented from the initial if statement
      // in order to get the next node
      skip = current - i

      // recursive evaluate of condition branch
      if (branch) Array.prototype.push.apply(m, walk(opts, branch))
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

      // converts nodes to a string. These nodes will be changed within the loop
      const treeString = JSON.stringify(node.content)
      const keys = loopParams.keys

      // creates a copy of the keys that will be changed within the loop
      const localsBackup = makeLocalsBackup(keys, opts.locals)

      // run the loop, different types of loops for arrays and objects
      if (Array.isArray(target)) {
        for (let index = 0; index < target.length; index++) {
          m.push(executeLoop(keys, target[index], index, opts.locals, treeString))
        }
      } else {
        for (let key in target) {
          m.push(executeLoop(keys, target[key], key, opts.locals, treeString))
        }
      }

      // returns the original keys values that was changed within the loop
      opts.locals = revertBackupedLocals(keys, opts.locals, localsBackup)

      // return directly out of the loop, which will skip the "each" tag
      return m
    }

    // parse scopes
    if (node.tag === scopes[0]) {
      // handle syntax error
      if (!node.attrs || !node.attrs.with) {
        throw new Error(`the "${scopes[0]}" tag must have a "with" attribute`)
      }

      const target = vm.runInContext(node.attrs.with, ctx)

      // handle additional syntax errors
      if (typeof target !== 'object' || Array.isArray(target)) {
        throw new Error('You must provide an object to make scope')
      }

      const keys = Object.keys(target)

      // creates a copy of the keys that will be changed within the loop
      const localsBackup = makeLocalsBackup(keys, opts.locals)

      m.push(executeScoped(target, opts.locals, node))

      // returns the original keys values that was changed within the loop
      opts.locals = revertBackupedLocals(keys, opts.locals, localsBackup)

      // return directly out of the loop, which will skip the "scope" tag
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
 * expression to be looped.
 */
function parseLoopStatement (input) {
  // try to find ` in ` keyword
  const inKeywordIndex = input.search(/\sin\s/)

  // if we reach the end of the string without getting "in", it's an error
  if (inKeywordIndex === -1) {
    throw new Error("Loop statement lacking 'in' keyword")
  }

  // expression is always after `in` keyword
  const expression = input.substr(inKeywordIndex + 4)

  // keys is always before `in` keyword
  const keys = input.substr(0, inKeywordIndex).split(',')
  for (let i = 0; i < keys.length; i++) {
    keys[i] = keys[i].trim()
  }

  return {
    keys,
    expression
  }
}

/**
 * Creates a backup of keys values
 */
function makeLocalsBackup (keys, locals) {
  let backup = {}

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (locals.hasOwnProperty(key)) backup[key] = cloneDeep(locals[key])
  }

  return backup
}

/**
 * Returns the original keys values
 */
function revertBackupedLocals (keys, locals, backup) {
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    // remove key from locals
    delete locals[key]

    // revert copied key value
    if (backup.hasOwnProperty(key)) locals[key] = backup[key]
  }

  return locals
}

/**
 * Creates a set of local variables within the loop, and evaluates all nodes
 * within the loop, returning their contents
 */
function executeLoop (loopParams, p1, p2, locals, treeString) {
  // two loop locals are allowed
  // - for arrays it's the current value and the index
  // - for objects, it's the value and the key
  const scopedLocals = locals
  scopedLocals[loopParams[0]] = p1
  if (loopParams[1]) scopedLocals[loopParams[1]] = p2

  return walk({ locals: scopedLocals }, JSON.parse(treeString))
}

/**
 * Runs walk function with arbitrary set of local variables
 */
function executeScoped (scopeLocals, locals, node) {
  const scopedLocals = Object.assign(locals, scopeLocals)
  return walk({ locals: scopedLocals }, node.content)
}
