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
    t.is(err.message, 'Invalid or unexpected token')
  })
})

test('Raw output', (t) => {
  return process(t, 'raw', { locals: { foo: 'bar' } })
})
