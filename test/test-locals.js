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

function clean (html) {
  return html.replace(/[^\S\r\n]+$/gm, '').trim()
}

test('Basic', (t) => {
  return process(t, 'script-locals')
})

test('Remove script locals', (t) => {
  return process(t, 'script-locals-remove', { removeScriptLocals: true })
})
