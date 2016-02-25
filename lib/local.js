'use strict'

module.exports = function (style, el) {
  if (style === '{{') {

    return el.replace('{{', '').replace('}}', '')

  } else if (style === '{%') {

    return el.replace('{%', '').replace('%}', '')

  } else if (style === '@') {

    return el.replace('@', '')

  }

  return el.replace('{', '').replace('}', '')
}
