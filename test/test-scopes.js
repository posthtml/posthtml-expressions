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

function clean (html) {
  return html.replace(/[^\S\r\n]+$/gm, '').trim()
}

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
