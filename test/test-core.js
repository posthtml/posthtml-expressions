const test = require('ava')

const join = require('path').join
const readSync = require('fs').readFileSync

const posthtml = require('posthtml')
const beautify = require('posthtml-beautify')
const expressions = require('../lib')

const fixture = (file) => {
  return readSync(join(__dirname, 'fixtures', `${file}.html`), 'utf8')
}

const expect = (file) => {
  return readSync(join(__dirname, 'expect', `${file}.html`), 'utf8')
}

function process (t, name, options, log = false, plugins = [expressions(options)], processOptions = {}) {
  return posthtml(plugins)
    .process(fixture(name), processOptions)
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
    delimiters: ['%[', ']%'],
    unescapeDelimiters: ['%[[', ']]%'],
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

test('Expressions - ignored', (t) => {
  return process(t, 'expression_ignored', { locals: { foo: 'bar' } })
})

test('Raw output', (t) => {
  return process(t, 'raw', { locals: { foo: 'bar' } })
})

test('Raw output - inside condition', (t) => {
  return process(t, 'raw_in_condition', { locals: { foo: 'bar' } })
})

test('Raw output - custom tag', (t) => {
  return process(t, 'raw_custom', { ignoredTag: 'verbatim', locals: { foo: 'bar' } })
})

test('Boolean attribute', (t) => {
  return process(t, 'boolean_attr', null, false, [beautify(), expressions()])
})

test('Directives options', (t) => {
  return process(t, 'directives', null, false, [expressions()], {
    directives: [{
      name: '?php',
      start: '<',
      end: '>',
    }]
  })
})
