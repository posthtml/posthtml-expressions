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
  return posthtml([expressions(options)])
    .process(fixture(name))
    .then((result) => {
      log && console.log(result.html)

      return clean(result.html)
    })
    .then((html) => {
      t.is(html, expect(name).trim())
    })
}

function error (name, cbErr, cbSuccess, pluginOptions) {
  return posthtml([expressions(pluginOptions)])
    .process(fixture(name))
    .then(cbSuccess)
    .catch(cbErr)
}

function clean (html) {
  return html.replace(/[^\S\r\n]+$/gm, '').trim()
}

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

test('Loops - conditional and locals included', (t) => {
  return process(t, 'loop_conditional_locals', {
    locals: {
      pages: [
        { path: '/page1', title: 'Page 1' },
        { path: '/page2', title: 'Page 2' },
        { path: '/page3', title: 'Page 3' }
      ],
      current_path: '/page1'
    }
  })
})

test('Loops - conflicting locals', (t) => {
  return process(t, 'loop_conflict', {
    locals: { items: [1, 2, 3], item: 'bar' }
  })
})

test('Loops - custom tag', (t) => {
  return process(t, 'loop_customtag', {
    loopTags: ['for', 'each'],
    locals: { items: [1, 2, 3] }
  })
})

test('Loops - no loop attribute', (t) => {
  return error('loop_no_attr', (err) => {
    t.is(err.message, 'the "each" tag must have a "loop" attribute')
  })
})

test('Loops - no array or object passed', (t) => {
  return error('loop_no_collection', (err) => {
    t.is(err.toString(), 'Error: You must provide an array or object to loop through')
  })
})

test('Loops - no array or object passed with disabled strict mode', (t) => {
  return error('loop_no_collection', () => {}, (response) => {
    t.truthy(response)
  }, { strictMode: false })
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
    t.is(err.message, 'SyntaxError: Invalid or unexpected token')
  })
})

test('Loops - metadata', (t) => {
  return process(t, 'loop_metadata', {
    locals: { items: [1, 2, 3] }
  })
})

test('Loops - nested metadata', (t) => {
  return process(t, 'loop_nested_metadata', {
    locals: { items: { foo: [1, 2], bar: [3, 4] } }
  })
})
