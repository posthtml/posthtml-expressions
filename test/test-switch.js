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
      t.truthy(html === expect(name).trim())
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

test('Switch', (t) => {
  return Promise.all([
    process(t, 'switch', { locals: { country: 'germany' } })
  ])
})

test('Switch - default branch', (t) => {
  return Promise.all([
    process(t, 'switch_default', { locals: { country: 'venezuela' } })
  ])
})

test('Switch - nested', (t) => {
  return Promise.all([
    process(t, 'switch_nested', {
      locals: {
        country_one: 'venezuela',
        country_two: 'russia'
      }
    })
  ])
})

test('Switch - custom tag', (t) => {
  return process(t, 'switch_customtag', {
    switchTags: ['s', 'c', 'd'],
    locals: { country: 'us' }
  })
})

test('Switch - dynamic expression', (t) => {
  return Promise.all([
    process(t, 'switch_number', { locals: { items: [1, 2, 3] } })
  ])
})

test('Switch - no switch attribute', (t) => {
  return error('switch_no_attr', (err) => {
    t.truthy(err.toString() === 'Error: the "switch" tag must have a "expression" attribute')
  })
})

test('Switch - no case attribute', (t) => {
  return error('switch_no_case_attr', (err) => {
    t.is(err.message, 'the "switch" tag must have a "expression" attribute')
  })
})

test('Switch - bad flow', (t) => {
  return error('switch_bad_flow', (err) => {
    t.is(err.message, 'the "switch" tag can contain only "case" tags and one "default" tag')
  })
})
