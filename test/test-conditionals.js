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

function error (name, cb) {
  return posthtml([expressions()])
    .process(fixture(name))
    .catch(cb)
}

function clean (html) {
  return html.replace(/[^\S\r\n]+$/gm, '').trim()
}

test('Conditionals', (t) => {
  return process(t, 'conditional', { locals: { foo: 'bar' } })
})

test('Conditionals - only "if" condition', (t) => {
  return process(t, 'conditional_if', { locals: { foo: 'bar', bool: '' } })
})

test('Conditionals - no render', (t) => {
  return process(t, 'conditional_norender', {})
})

test('Conditionals - "if" tag missing condition', (t) => {
  return error('conditional_if_error', (err) => {
    t.is(err.toString(), 'Error: the "if" tag must have a "condition" attribute')
  })
})

test('Conditionals - "elseif" tag missing condition', (t) => {
  return error('conditional_elseif_error', (err) => {
    t.is(err.toString(), 'Error: the "elseif" tag must have a "condition" attribute')
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
    t.is(err.name, 'SyntaxError')
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
