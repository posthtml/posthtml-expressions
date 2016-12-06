[![npm][npm]][npm-url]
[![node][node]][node-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![code style][style]][style-url]
[![chat][chat]][chat-url]

<div align="center">
  <img width="110" height="100" title="PostHTML Plugin" vspace="50" src="http://michael-ciniawsky.github.io/postcss-load-plugins/logo.svg">
  <img width="220" height="200" title="PostHTML" src="http://posthtml.github.io/posthtml/logo.svg">
  <h1>Expressions Plugin</h1>
</div>

<h2 align="center">Install</h2>

```bash
npm i -D posthtml-expressions
```

<h2 align="center">Usage</h2>

```js
const { readFileSync } = require('fs')

const posthtml = require('posthtml')
const expressions = require('posthtml-expressions')

posthtml(expressions({ locals: { foo: 'bar' } }))
  .process(readFileSync('index.html', 'utf8'))
  .then((result) => console.log(result.html))
```

This plugin provides a syntax for including local variables and expressions in your templates, and also extends custom tags to act as helpers for conditionals and looping.

You have full control over the delimiters used for injecting locals, as well as the tag names for the conditional and loop helpers, if you need them. All options that can be passed to the `expressions` plugin are shown below:

<h2 align="center">Options</h2>

|Option|Default|Description|
|:----:|:-----:|:----------|
| **delimiters** | `['{{', '}}']` | Array containing beginning and ending delimiters for escaped locals |
| **unescapeDelimiters** | `['{{{', '}}}']` | Array containing beginning and ending delimiters for unescaped locals |
| **locals** | `{}` | Object containing any local variables you want to be available inside your expressions |
| **conditionalTags** | `['if', 'elseif', 'else']` | Array containing names for tags used for `if/else if/else` statements |
| **switchTags** | `['switch', 'case', 'default']` | Array containing names for tags used for `switch/case/default` statements |
| **loopTags** | `['each']` | Array containing names for `for` loops |
| **scopeTags** | `['scope']` | Array containing names for scopes |

### Locals

You can inject locals into any piece of content in your html templates, other than overwriting tag names. For example, if you passed the following config to the expressions plugin:

```js
locals: { className: 'intro', name: 'Marlo' }
```

```html
<div class="{{ className }}">
  My name is {{ name }}
</div>
```

```html
<div class="intro">
  My name is Marlo
</div>
```

### Unescaped Locals

By default, special characters will be escaped so that they show up as text, rather than html code. For example, if you had a local containing valid html as such:

```js
locals: { statement: '<strong>wow!</strong>' }
```

```html
<p>The fox said, {{ statement }}</p>
```

```html
<p>The fox said, &lt;strong&gt;wow!&lt;strong&gt;</p>
```

In your browser, you would see the angle brackets, and it would appear as intended. However, if you wanted it instead to be parsed as html, you would need to use the `unescapeDelimiters`, which by default are three curly brackets, like this:

```html
<p>The fox said, {{{ strongStatement }}}</p>
```

In this case, your code would render as html:

```html
<p>The fox said, <strong>wow!<strong></p>
```

### Expressions

You are not limited to just directly rendering local variables either, you can include any type of javascript expressions and it will be evaluated, with the result rendered. For example:

```html
<p class="{{ env === 'production' ? 'active' : 'hidden' }}">in production!</p>
```

With this in mind, it is strongly recommended to limit the number and complexity of expressions that are run directly in your template. You can always move the logic back to your config file and provide a function to the locals object for a smoother and easier result. For example:

```js
locals: {
  isProduction: (env) => env === 'production' ? 'active' : 'hidden'
}
```

```html
<p class="{{ isProduction(env) }}">in production!</p>
```

### Conditionals

Conditional logic uses normal html tags, and modifies/replaces them with the results of the logic. If there is any chance of a conflict with other custom tag names, you are welcome to change the tag names this plugin looks for in the options. For example, given the following config:

```js
locals: { foo: 'foo' }
```

```html
<if condition="foo === 'bar'">
  <p>Foo really is bar! Revolutionary!</p>
</if>

<elseif condition="foo === 'wow'">
  <p>Foo is wow, oh man.</p>
</elseif>

<else>
  <p>Foo is probably just foo in the end.</p>
</else>
```

```html
<p>Foo is probably just foo in the end.</p>
```

Anything in the `condition` attribute is evaluated directly as an expressions.

It should be noted that this is slightly cleaner-looking if you are using the [SugarML parser](https://github.com/posthtml/sugarml). But then again so is every other part of html.

```sml
if(condition="foo === 'bar'")
  p Foo really is bar! Revolutionary!

elseif(condition="foo === 'wow'")
  p Foo is wow, oh man.

else
  p Foo is probably just foo in the end.
```

### Switch statement

Switch statements act like streamline conditionals. They are useful for when you want to compare a single variable against a series of constants.

```js
locals: { foo: 'foo' }
```

```html
<switch expression="foo">
  <case n="'bar'">
    <p>Foo really is bar! Revolutionary!</p>
  </case>
  <case n="'wow'">
    <p>Foo is wow, oh man.</p>
  </case>
  <default>
    <p>Foo is probably just foo in the end.</p>
  </default>
</switch>
```

```html
<p>Foo is probably just foo in the end.</p>
```

Anything in the `expression` attribute is evaluated directly as an expressions.

### Loops

You can use the `each` tag to build loops. It works with both arrays and objects. For example:

```js
locals: {
  array: ['foo', 'bar'],
  object: { foo: 'bar' }
}
```

**Array**
```html
<each loop="item, index in array">
  <p>{{ index }}: {{ item }}</p>
</each>
```

```html
<p>1: foo</p>
<p>2: bar</p>
```

**Object**
```html
<each loop="value, key in anObject">
  <p>{{ key }}: {{ value }}</p>
</each>
```

```html
<p>foo: bar</p>
```

The value of the `loop` attribute is not a pure expressions evaluation, and it does have a tiny and simple custom parser. Essentially, it starts with one or more variable declarations, comma-separated, followed by the word `in`, followed by an expressions.


```html
<each loop="item in [1,2,3]">
  <p>{{ item }}</p>
</each>
```

So you don't need to declare all the available variables (in this case, the index is skipped), and the expressions after `in` doesn't need to be a local variable, it can be any expressions.

### Scopes

You can replace locals inside certain area wrapped in a `<scope>` tag. For example you can use it after [posthtml-include](https://github.com/posthtml/posthtml-include)

```js
locals: {
  author: { name: 'John'},
  editor: { name: 'Jeff'}
}
```

```html
<scope with="author">
  <include src="components/profile.html"></include>
</scope>
<scope with="editor">
  <include src="components/profile.html"></include>
</scope>
```

```html
<div class="profile">
  <div class="profile__name">{{ name }}</div>
  <img class="profile__avatar" src="{{ image }}" alt="{{ name }}'s avatar" />
  <a class="profile__link" href="{{ link }}">more info</a>
</div>
```

<h2 align="center">Maintainers</h2>

<table>
  <tbody>
   <tr>
    <td align="center">
      <img width="150 height="150"
      src="https://avatars.githubusercontent.com/u/556932?v=3&s=150">
      <br>
      <a href="https://github.com/jescalan">Jeff Escalante</a>
    </td>
    <td align="center">
      <img width="150 height="150"
      src="https://avatars.githubusercontent.com/u/7034281?v=3&s=150">
      <br>
      <a href="https://github.com/mrmlnc">Denis Malinochkin</a>
    </td>
   </tr>
  <tbody>
</table>

<h2 align="center">Contributors</h2>

<table>
  <tbody>
   <tr>
    <td align="center">
      <img width="150 height="150"
      src="https://avatars.githubusercontent.com/u/5419992?v=3&s=150">
      <br>
      <a href="https://github.com/michael-ciniawsky">Michael Ciniawsky</a>
    </td>
    <td align="center">
      <img width="150 height="150"
      src="https://avatars.githubusercontent.com/u/17473315?v=3&s=150">
      <br>
      <a href="https://github.com/xakdog">Krillin</a>
    </td>
   </tr>
  <tbody>
</table>


[npm]: https://img.shields.io/npm/v/posthtml-expressions.svg
[npm-url]: https://npmjs.com/package/posthtml-expressions

[node]: https://img.shields.io/node/v/posthtml-expressions.svg
[node-url]: https://nodejs.org/

[deps]: https://david-dm.org/posthtml/posthtml-expressions.svg
[deps-url]: https://david-dm.org/posthtml/posthtml-expressions

[tests]: http://img.shields.io/travis/posthtml/posthtml-expressions.svg
[tests-url]: https://travis-ci.org/posthtml/posthtml-expressions

[cover]: https://coveralls.io/repos/github/posthtml/posthtml-expressions/badge.svg
[cover-url]: https://coveralls.io/github/posthtml/posthtml-expressions

[style]: https://img.shields.io/badge/code%20style-standard-yellow.svg
[style-url]: http://standardjs.com/

[chat]: https://badges.gitter.im/posthtml/posthtml.svg
[chat-url]: https://gitter.im/posthtml/posthtml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"
