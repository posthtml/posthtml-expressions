# Expressions for PostHTML

## Install
```bash
(sudo) npm i -D posthtml-exp
```

## Options
### Style
Choose one of the following expression syntaxes.
If **** options.style **** is unset, the default syntax (JSX) is used.

##### JSX: **'{'**

```html
<div id="{id}" class="{class}">${content}</div>
```
##### HBS:  **'{{'**

```html
<div id="{{id}}" class="{{class}}">{{content}}</div>
```
##### Blaze:  **'@'**

```html
<div id="@id" class="@name">@content</div>
```
### Locals
#### Set locals directly as arguments
```js
let exps = require('posthtml-exp')({
  locals: {/* locals */}
})
```
#### Load locals from an external file
```js
let exps = require('posthtml-exp')({
  locals: {/* 'path/to/file.(js|json) '*/}
})
```
```js
exports = module.exports = {/* locals */}
```
```json
{
  "name": "PostHTML Exps",
  "repo": {
    "name": "posthtml-exp",
    "url": "https://github.com/michael-ciniawsky/posthtml-exp"
  }
}
```

## Paths
Expression and Helper arguments can be expressed with dot notation syntax. The current limit for nesting is set to 3.
```js
{
  local: {
    key1: {
      key2: {
        key3: 'PostHtML Expressions'
      }
    }
  }
}
```
```html
<div>
  <h2>{local.one.two.tree}</h2>
</div>
```
```html
<div>
  <h2>PostHTML Expressions</h2>
</div>
```

## Helpers
### Each **{...}**
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

### Pipe **{ | }**
```js
{
  locals: {
    firstname: 'PostHTML',
    lastname: 'Expressions'
  }
}
```
```html
<h1>{locals|firstname|lastname}</h1>
```
```html
<h1>PostHTML Expressions</h1>
```

### Partial **{> }**
```js
{
  locals: {
    button: './includes/button.html'
  }
}
```
```html
<div>{> button}</div>
```
```html
<div>
  <button>Click Me!</button>
</div>
```

## Usage
For general usage and build process integration see [PostHTML Docs](https://github.com/posthtml/posthtml#usage)

### Example using Node API
#### Default
```js
'use strict'

const fs = require('fs')

const posthtml = require('posthtml')

const exp = require('posthtml-exp')({
  locals: {
    id: 'title',
    class: 'header',
    content: 'PostHTML Exps Default'
  }
})

let file = fs.readFileSync('./index.html', 'utf-8')

posthtml([ exp ])
  .process(file)
  .then(result => console.log(result.html))
```
##### Input
```html
<div class={class}>
  <h1 id={id}>{content}</h1>
</div>
```
##### Output
```html
<div class="header">
   <h1 id="title">PostHTML Exps</h1>
</div>
```
#### Custom
```js
'use strict'

const fs = require('fs')

const posthtml = require('posthtml')

const exp = require('posthtml-exp')({
  style: '{{',
  locals: {
    id: 'title',
    class: 'header',
    content: 'PostHTML Exps Default'
  }
})

let file = fs.readFileSync('./index.html', 'utf-8')

posthtml([ exp ])
  .process(file)
  .then(result => console.log(result.html))
```
##### Input
```html
<div class={{class}}>
  <h1 id={{id}}>{{content}}</h1>
</div>
```
##### Output
```html
<div class="header">
   <h1 id="title">PostHTML Exps Custom</h1>
</div>
```
