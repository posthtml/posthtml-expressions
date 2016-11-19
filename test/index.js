const test = require('ava')

const join = require('path').join
const readSync = require('fs').readFileSync

const posthtml = require('posthtml')
const expressions = require('../lib')

const fixture = (file) => {
  return readSync(join(__dirname, 'fixtures', `${file}.html`), 'utf8')
}

const expect = (file) => {
  return readSync(join(__dirname, 'expect', `${file}.html`), 'utf8')
}

function process (t, name, options, log = false) {
  return posthtml([ expressions(options) ])
    .process(fixture(name))
    .then((result) => {
      log && console.log(result.html)

      return clean(result.html)
    })
    .then((html) => {
      t.truthy(html === expect(name).trim())
    })
}

function error (name, cb) {
  return posthtml([ expressions() ])
    .process(fixture(name))
    .catch(cb)
}

function clean (html) {
  return html.replace(/[^\S\r\n]+$/gm, '').trim()
}

test('Basic', (t) => {
  return process(t, 'basic', { locals: { test: 'wow' } })
})

test('Escaped', (t) => {
  return process(t, 'escape_html', { locals: { lt: '<', gt: '>' } })
})

test('Unescaped', (t) => {
  return process(t, 'unescaped', {
    locals: { el: '<strong>wow</strong>' }
  })
})

test('Delimiters', (t) => {
  return process(t, 'custom_delimiters', {
    delimiters: ['{%', '%}'],
    unescapeDelimiters: ['{{%', '%}}'],
    locals: { test: 'wow' }
  })
})

test('Expressions - spacing', (t) => {
  return process(t, 'expression_spacing', { locals: { foo: 'X' } })
})

test('Expressions - error', (t) => {
  return error('expression_error', (err) => {
    t.truthy(err.toString() === 'SyntaxError: Unexpected token ILLEGAL')
  })
})

test('Conditionals', (t) => {
  return process(t, 'conditional', { locals: { foo: 'bar' } })
})

test('Conditionals - only "if" condition', (t) => {
  return process(t, 'conditional_if', { locals: { foo: 'bar' } })
})

test('Conditionals - no render', (t) => {
  return process(t, 'conditional_norender', {})
})

test('Conditionals - "if" tag missing condition', (t) => {
  return error('conditional_if_error', (err) => {
    t.truthy(err.toString() === 'Error: the "if" tag must have a "condition" attribute')
  })
})

test('Conditionals - "elseif" tag missing condition', (t) => {
  return error('conditional_elseif_error', (err) => {
    t.truthy(err.toString() === 'Error: the "elseif" tag must have a "condition" attribute')
  })
})

test('Conditionals - other tag in middle of statement', (t) => {
  return process(t, 'conditional_tag_break', {})
})

test('Conditionals - nested conditionals', (t) => {
  return process(t, 'conditional_nested', {})
})

test('conditional - expression error', (t) => {
  return error('conditional_expression_error', (err) => {
    t.truthy(err.toString() === 'SyntaxError: Unexpected token ILLEGAL')
  })
})

test('Conditionals - custom tags', (t) => {
  return process(t, 'conditional_customtags', {
    conditionalTags: ['zif', 'zelseif', 'zelse'],
    locals: { foo: 'bar' }
  })
})

test('Conditionals - expression in else/elseif', (t) => {
  return process(t, 'conditional_expression', {
    locals: { foo: 'bar' }
  })
})

test('Loops', (t) => {
  return process(t, 'loop', { locals: { items: [1, 2, 3] } })
})

test('Loops - {Object}', (t) => {
  return process(t, 'loop_object', {
    locals: { items: { a: 'b', c: 'd' } }
  })
})

test('Loops - nested', (t) => {
  return process(t, 'loop_nested', {
    locals: { items: { c1: [1, 2, 3], c2: [4, 5, 6] } }
  })
})

test('Loops - locals included', (t) => {
  return process(t, 'loop_locals', {
    locals: { items: [1, 2, 3], foo: 'bar' }
  })
})

test('Loops - conditional included', (t) => {
  return process(t, 'loop_conditional', {
    locals: { items: [1, 2, 3] }
  })
})

test('Loops - conflicting locals', (t) => {
  return process(t, 'loop_conflict', {
    locals: { items: [1, 2, 3], item: 'bar' }
  })
})

test('Loops - custom tag', (t) => {
  return process(t, 'loop_customtag', {
    loopTags: ['zeach'],
    locals: { items: [1, 2, 3] }
  })
})

test('Loops - no loop attribute', (t) => {
  return error('loop_no_attr', (err) => {
    t.truthy(err.toString() === 'Error: the "elseif" tag must have a "loop" attribute')
  })
})

test('Loops - no array or object passed', (t) => {
  return error('loop_no_collection', (err) => {
    t.truthy(err.toString() === 'Error: You must provide an array or object to loop through')
  })
})

test('Loops - no loop arguments', (t) => {
  return error('loop_no_args', (err) => {
    t.truthy(err.toString() === 'Error: You must provide at least one loop argument')
  })
})

test('Loops - no "in" keyword', (t) => {
  return error('loop_no_in', (err) => {
    t.truthy(err.toString() === "Error: Loop statement lacking 'in' keyword")
  })
})

test('Loops - expression error', (t) => {
  return error('loop_expression_error', (err) => {
    t.truthy(err.toString() === 'SyntaxError: Unexpected token ILLEGAL')
  })
})

test('Scopes', (t) => {
  return process(t, 'scope', {
    locals: {
      author: { name: 'John', age: 26 },
      name: 'Scope',
      key: 'test'
    }
  })
})

test('Scopes - nested', (t) => {
  return process(t, 'scope_nested', {
    locals: {
      key: 'global',
      scope: {
        key: 'scope',
        one: {
          key: 'one'
        },
        two: {
          key: 'two'
        }
      }
    }
  })
})
