const test = require('ava')
const path = require('path')
const posthtml = require('posthtml')
const exp = require('../lib')
const {readFileSync} = require('fs')
const fixtures = path.join(__dirname, 'fixtures')

test('basic', (t) => {
  return matchExpected(t, 'basic', { locals: { test: 'wow' } })
})

function matchExpected (t, name, config) {
  const html = readFileSync(path.join(fixtures, `${name}.html`), 'utf8')
  const expected = readFileSync(path.join(fixtures, `${name}.expected.html`), 'utf8')

  return posthtml([exp(config)])
    .process(html)
    .then((res) => { t.truthy(res.html === expected) })
}
