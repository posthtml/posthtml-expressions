/**
 * @description Get the nect tag from a node list
 *
 * @method getNextTag
 *
 * @param  {Array}   nodes Nodes
 * @param  {Number}  i     Accumulator
 *
 * @return {Array}   []    Array containing the next tag in nodes
 */
function getNextTag (nodes, i) {
  // loop until we get the next tag (bypassing newlines etc)
  while (i < nodes.length) {
    const node = nodes[i]

    if (typeof node === 'object') {
      return [i, node]
    } else {
      i++
    }
  }

  return [ i, { tag: undefined } ]
}

/**
 * @module tags
 *
 * @type {Function}
 */
module.exports = getNextTag
