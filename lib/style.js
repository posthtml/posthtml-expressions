exports = module.exports = function (style, el) {
  if (el) {
    if (style === '$') {

      return `\${${el}}`

    } else if (style === '{{') {

      return `{{${el}}}`

    } else if (style === '{%') {

      return `{%${el}%}`

    } else if (style === '@') {

      return `@${el}`
    }
    return `{${el}}`
  }
}
