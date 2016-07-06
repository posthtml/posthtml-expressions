const fs = require('fs')
const posthtml = require('posthtml')
const exps = require('../index')
const html = fs.readFileSync('./index.html', 'utf8')

posthtml([ exps({ style: '{', locals: './test/locals.js' }) ])
  .process(html)
  .then(result => console.log(result.html))
