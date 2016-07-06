# Expressions for PostHTML

Local variables, expressions, loops, and conditionals in your html

## Installation

First, install from npm with `npm i posthtml-exp --save`, then add it as a plugin to your posthtml pipeline:

```js
const posthtml = require('posthtml')
const exp = require('posthtml-exp')
const {readFileSync} = require('fs')

posthtml(exp({ locals: { foo: 'bar' } }))
  .process(readFileSync('exampleFile.html', 'utf8'))
  .then(console.log)
```

## Usage

This plugin provides a syntax for including local variables and expressions in your templates, and also extends custom tags to act as helpers for conditionals and looping.

You have full control over the delimiters used for injecting locals, as well as the tag names for the conditional and loop helpers, if you need them. All options that can be passed to the `exp` plugin are shown below:

| Option | Description | Default |
| ------ | ----------- | ------- |
| **delimiters** | Array containing beginning and ending delimiters for escaped locals. | `['{{', '}}']` |
| **unescapeDelimiters** | Array containing beginning and ending delimiters for inserting unescaped locals. | `['{{{', '}}}']` |
| **locals** | Object containing any local variables you want to be available inside your expressions. |
| **conditionalTags** | Array containing names for tags used for standard `if`/`else if`/`else` logic | `['if', 'elseif', 'else']` |
| **loopTags** | Array containing names for standard `for` loop logic | `['each']` |

### Locals

You can inject locals into any piece of content in your html templates, other than overwriting tag names. For example, if you passed the following config to the exp plugin:

```js
exp({
  locals: { myClassName: 'introduction', myName: 'Jeff' }
})
```

And compiled with the following template:

```html
<div class="{{ myClassName }}">
  My name is {{ myName }}
</div>
```

You would get this as your output:

```html
<div class="introduction">
  My name is Jeff
</div>
```

### Unescaped Locals

By default, special characters will be escaped so that they show up as text, rather than html code. For example, if you had a local containing valid html as such:

```js
exp({
  locals: { strongStatement: '<strong>wow!</strong>' }
})
```

And you rendered it into a tag like this:

```html
<p>The fox said, {{ strongStatement }}</p>
```

You would see the following output:

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

You are not limited to just directly rendering local variables either, you can include any type of javascript expression and it will be evaluated, with the result rendered. For example:

```html
<p class="{{ env === 'production' ? 'active' : 'hidden' }}">in production!</p>
```

With this in mind, it is strongly recommended to limit the number and complexity of expressions that are run directly in your template. You can always move the logic back to your config file and provide a function to the locals object for a smoother and easier result. For example:

```js
exp({
  locals: {
    isProduction: (env) => {
      return env === 'production' ? 'active' : 'hidden'
    }
  }
})
```

```html
<p class="{{ isProduction(env) }}">in production!</p>
```

### Conditional Logic

Conditional logic uses normal html tags, and modifies/replaces them with the results of the logic. If there is any chance of a conflict with other custom tag names, you are welcome to change the tag names this plugin looks for in the options. For example, given the following config:

```js
exp({
  locals: { foo: 'foo' }
})
```

And the following html:

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

Your result would be only this:

```html
<p>Foo is probably just foo in the end.</p>
```

Anything in the `condition` attribute is evaluated directly as an expression.

It should be noted that this is slightly cleaner-looking if you are using the [SugarML parser](https://github.com/posthtml/sugarml). But then again so is every other part of html.

```sml
if(condition="foo === 'bar'")
  p Foo really is bar! Revolutionary!
elseif(condition="foo === 'wow'")
  p Foo is wow, oh man.
else
  p Foo is probably just foo in the end.
```

#### Loops

You can use the `each` tag to build loops. It works with both arrays and objects. For example:

```js
exp({
  locals: {
    anArray: ['foo', 'bar'],
    anObject: { foo: 'bar' }
  }
})
```

```html
<each loop="item, index in anArray">
  <p>{{ index }}: {{ item }}</p>
</each>
```

Output:

```html
<p>1: foo</p>
<p>2: bar</p>
```

And an example using an object:

```html
<each loop="key, value in anObject">
  <p>{{ key }}: {{ value }}</p>
</each>
```

Output:

```html
<p>foo: bar</p>
```

The value of the `loop` attribute is not a pure expression evaluation, and it does have a tiny and simple custom parser. Essentially, it starts with one or more variable declarations, comma-separated, followed by the word `in`, followed by an expression.

So this would also be fine:

```html
<each loop="item in [1,2,3]">
  <p>{{ item }}</p>
</each>
```

So you don't need to declare all the available variables (in this case, the index is skipped), and the expression after `in` doesn't need to be a local variable, it can be any expression.
