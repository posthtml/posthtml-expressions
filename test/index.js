<<<<<<< HEAD
// ------------------------------------
// #POSTHTML - EXP - TEST
// ------------------------------------

'use strict'

const test = require('ava')

const { join } = require('path')
const { readFileSync } = require('fs')

const fixtures = (file) => readFileSync(join(__dirname, 'fixtures', file), 'utf8')
const expected = (file) => readFileSync(join(__dirname, 'expected', file), 'utf8')

const posthtml = require('posthtml')
const plugin = require('..')

test('', (t) => {
  posthtml([ plugin() ])
    .process(fixtures('index.html'))
    .then((result) => {
      console.log(result.html)
      t.is(expected('index.html'), result.html)
    })
})
=======
const fs = require('fs')
const posthtml = require('posthtml')
const exps = require('../index')
const html = fs.readFileSync('./index.html', 'utf8')

posthtml([ exps({ style: '{', locals: './test/locals.js' }) ])
  .process(html)
  .then(result => console.log(result.html))
>>>>>>> origin/master
