'use strict'

const vm = require('vm')

const matchHtmlRegexp = /[&<>"']/g
const htmlSymbolsMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#039;'
}

function escapeHtmlCharacters (unsafe) {
  return unsafe.replace(matchHtmlRegexp, (match) => htmlSymbolsMap[match])
};

module.exports = function replace (input, ctx, settings) {
  // Since we are matching multiple sets of delimiters, we need to run a loop
  // here to match each one.
  for (let i = 0; i < settings.length; i++) {
    const matches = input.match(settings[i].regexp)
    if (!matches) continue

    const delimiters = settings[i].text
    for (let j = 0; j < matches.length; j++) {
      const match = matches[j]
      const expression = match.substring(delimiters[0].length, match.length - delimiters[1].length).trim()

      // If expression has non-word characters then use VM
      let value
      if (/\W+/.test(expression)) {
        value = vm.runInContext(expression, ctx)
      } else if (ctx.hasOwnProperty(expression)) {
        value = ctx[expression]
      }

      // Escape html if necessary
      if (settings[i].escape && typeof value === 'string') {
        value = escapeHtmlCharacters(value)
      }

      // Replace placeholder on evaluated value
      input = input.replace(match, value)
    }
  }

  return input
}
