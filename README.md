[![NPM][npm]][npm-url]
[![Deps][deps]][deps-url]
[![Tests][travis]][travis-url]
[![Coverage][cover]][cover-url]
[![Standard Code Style][style]][style-url]

<div align="center">
  <img width="220" height="150" title="PostHTML" src="http://posthtml.github.io/posthtml/logo.svg">
  <h1>Expressions Plugin</h1>
</div>

<h2 align="center">Install</h2>

```bash
npm i -D posthtml-exp
```

<h2 align="center">Usage</h2>

```html
<div id="{{id}}" class="{{class}}">{{content}}</div>
```

### Locals

```js
const exp = require('posthtml-exp')({
  locals: {}
})
```

```js
const exp = require('posthtml-exp')({
  locals: 'path/to/file.(js|json)'
})
```

### Paths

Expression and Helper arguments can be at least nested 3 levels deep.

```js
{
  obj: {
    1: {
      2: {
        3: 'PostHTML Expressions'
      }
    }
  }
}
```
```html
<div>
  {{obj.1.2.3}}
</div>
```
```html
<div>
  PostHTML Expressions
</div>
```

### Helpers
#### Each **{...}**
```js
{
  locals: {
    fruits: ['Apple', 'Orange', 'Mango']
  }
}
```
```html
<ul>
  <li>{...fruits}</li>
</ul>
```
```html
<ul>
  <li>Apple</li>
  <li>Orange</li>
  <li>Mango</li>
</ul>
```

#### Pipe **{ | }**

```js
{
  locals: {
    firstname: 'PostHTML',
    lastname: 'Expressions'
  }
}
```
```html
<h1>{firstname | lastname}</h1>
```
```html
<h1>PostHTML Expressions</h1>
```

#### Import **{> }**
```js
{
  locals: {
    button: './button.html'
  }
}
```
```html
<div>
  {> button}
</div>
```
```html
<div>
  <button>Click Me!</button>
</div>
```

<h2 align="center">Example</h2>

```js
'use strict'

const { readFileSync } = require('fs')

const posthtml = require('posthtml')

const exp = require('posthtml-exp')({
  locals: {
    id: 'title',
    class: 'header',
    content: 'PostHTML Expressions'
  }
})

const html = readFileSync('./index.html', 'utf8')

posthtml([ exp ])
  .process(file)
  .then(result => console.log(result.html))
```

###### Input

```html
<div class={{class}}>
  <h1 id={{id}}>{{content}}</h1>
</div>
```

###### Output

```html
<div class="header">
   <h1 id="title">PostHTML Expressions</h1>
</div>
```

<h2 align="center">LICENSE</h2>

> MIT License (MIT)

> Copyright (c) 2016 PostHTML Michael Ciniawsky <michael.ciniawsky@gmail.com>

> Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

> The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[npm]: https://img.shields.io/npm/v/posthtml-exp.svg
[npm-url]: https://npmjs.com/package/posthtml-exp

[deps]: https://david-dm.org/posthtml/posthtml-exp.svg
[deps-url]: https://david-dm.org/posthtml/posthtml-exp

[style]: https://img.shields.io/badge/code%20style-standard-yellow.svg
[style-url]: http://standardjs.com/

[travis]: http://img.shields.io/travis/posthtml/posthtml-exp.svg
[travis-url]: https://travis-ci.org/posthtml/posthtml-exp

[cover]: https://coveralls.io/repos/github/posthtml/posthtml-exp/badge.svg?branch=master
[cover-url]: https://coveralls.io/github/posthtml/posthtml-exp?branch=master
