'use strict'

module.exports = function (locals, el) {
  if (Array.isArray(el)) {
    if (el.length === 2) return locals[el[0]][el[1]]
    if (el.length === 3) return locals[el[0]][el[1]][el[2]]
    if (el.length === 4) return locals[el[0]][el[1]][el[2]][el[3]]
  }
  return locals[el]
}
