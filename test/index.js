const test = require('ava')
const path = require('path')
const posthtml = require('posthtml')
const exp = require('../lib')
const {readFileSync} = require('fs')
const fixtures = path.join(__dirname, 'fixtures')

test('basic', (t) => {
  return matchExpected(t, 'basic', { locals: { test: 'wow' } })
})

test('escaped html', (t) => {
  return matchExpected(t, 'escape_html', { locals: { lt: '<', gt: '>' } })
})

test('unescaped', (t) => {
  return matchExpected(t, 'unescaped', {
    locals: { el: '<strong>wow</strong>' }
  })
})

test('expression spacing', (t) => {
  return matchExpected(t, 'expression_spacing', { locals: { foo: 'X' } })
})

function matchExpected (t, name, config, log = false) {
  const html = readFileSync(path.join(fixtures, `${name}.html`), 'utf8')
  const expected = readFileSync(path.join(fixtures, `${name}.expected.html`), 'utf8')

  return posthtml([exp(config)])
    .process(html)
    .then((res) => { log && console.log(res.html); return res })
    .then((res) => { t.truthy(res.html === expected) })
}
