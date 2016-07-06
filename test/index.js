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
  posthtml([ plugin({ style: '{{', locals: './test/locals.js' }) ])
    .process(fixtures('index.html'))
    .then((result) => {
      console.log(result.html)
      // t.is(expected('index.html'), result.html)
    })
})
