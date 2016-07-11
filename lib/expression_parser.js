const vm = require('vm')

/**
 * This is a full character-by-character parse. Might as well do it right, regex
 * is just a little too janky.
 */
module.exports = function parseAndReplace (ctx, delimiters, input, escape = true) {
  let current = 0
  let char = input[current]
  let buf = []

  // We arrange delimiter search order by length, since it's possible that one
  // delimiter could 'contain' another delimiter, like '{{' and '{{{'. But if
  // you sort by length, the longer one will always match first.
  delimiters = delimiters.sort((d) => d.length)

  while (current < input.length) {
    // Since we are matching multiple sets of delimiters, we need to run a loop
    // here to match each one.
    for (let i = 0; i < delimiters.length; i++) {
      // current delimiter set
      const d = delimiters[i]

      // If we can match the full open delimiter, we pull its contents so we can
      // parse the expression
      if (char === d[0][0] && matchDelimiter(char, d[0]) === d[0]) {
        // Move past the open delimiter
        next(d[0].length)

        // Loop until we find the close delimiter
        let expression = ''
        while (matchDelimiter(char, d[1]) !== d[1]) {
          expression += char
          next()
        }

        // move past the close delimiter
        next(d[1].length)

        // evaluate the expression and push it to the output
        let expressionEval = vm.runInContext(expression.trim(), ctx)

        // escape html if necessary
        if (d[2] === 'escaped') expressionEval = escapeHtml(expressionEval)

        // push the full evaluated/escaped expression to the output buffer
        buf.push(expressionEval)
      }
    }

    buf.push(char)

    next()
  }

  // return the full string with expressions replaced
  return buf.join('')

  // Utility: From the current character, looks ahead to pull back a potential
  // delimiter match.
  function matchDelimiter (c, d) {
    return c + lookahead(d.length - 1)
  }

  // Utility: Move to the next character in the parse
  function next (n = 1) {
    for (let i = 0; i < n; i++) { char = input[++current] }
  }

  // Utility: looks ahead n characters and returns the result
  function lookahead (n) {
    let counter = current
    const target = current + n
    let res = ''
    while (counter < target) {
      res += input[++counter]
    }
    return res
  }

  // Utility: shamelessly stolen from jade/pug's runtime
  function escapeHtml (input) {
    const htmlRegex = /["&<>]/
    const regexResult = htmlRegex.exec(input)
    if (!regexResult) return input
    if (!input.match(htmlRegex)) return input

    let result = ''
    let i, lastIndex, escape
    for (i = regexResult.index, lastIndex = 0; i < input.length; i++) {
      switch (input.charCodeAt(i)) {
        case 34: escape = '&quot;'; break
        case 38: escape = '&amp;'; break
        case 60: escape = '&lt;'; break
        case 62: escape = '&gt;'; break
        default: continue
      }
      if (lastIndex !== i) result += input.substring(lastIndex, i)
      lastIndex = i + 1
      result += escape
    }
    if (lastIndex !== i) return result + input.substring(lastIndex, i)
    else return result
  }
}
