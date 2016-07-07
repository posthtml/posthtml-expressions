const vm = require('vm')

/**
 * This is a full character-by-character parse. Might as well do it right, regex
 * is just a little too janky.
 */
module.exports = function parseAndReplace (ctx, delimiters, input) {
  let current = 0
  let char = input[current]
  let buf = []

  while (current < input.length) {
    // If we can match the full open delimiter, we pull its contents so we can
    // parse the expression
    if (char === delimiters[0][0] &&
        matchDelimiter(char, delimiters[0]) === delimiters[0]) {
      // Move past the open delimiter
      next(delimiters[0].length)

      // Loop until we find the close delimiter
      let expression = ''
      while (matchDelimiter(char, delimiters[1]) !== delimiters[1]) {
        expression += char
        next()
      }

      // move past the close delimiter
      next(delimiters[1].length - 1)

      // evaluate the expression and push it to the output
      // TODO: implement html escaping here
      buf.push(vm.runInContext(expression.trim(), ctx))
    } else {
      buf.push(char)
    }

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
      res += input[counter]
      counter++
    }
    return res
  }
}
