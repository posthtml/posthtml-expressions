'use strict'

const fs = require('fs')

let posthtml = require('posthtml')

let exps = require('../index')({
  style: '{',
  locals: './test/locals.js'
})

let html = fs.readFileSync('./index.html', 'utf-8')

posthtml([ exps ])
  .process(html.toString())
  .then(result => console.log(result.html))
