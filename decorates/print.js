const {
  kTeamityChildren,
  kTeamityRoutes,
  kTeamityDecorates,
  kTeamityReply,
  kTeamityRouterPrefix
} = require('../symbols')

const tab = 4
const tabPad = '|'.padEnd(tab, ' ')
const tabPrefix = '|'.padEnd(tab, '-')

function printArrays (level, child, items, name) {
  if (items.length > 0) {
    const rPad = ''.padEnd((level + 1) * tab, tabPad)
    const rLine = `${rPad}${tabPrefix}${name}`
    child.$log.info(rLine)

    for (const url of items) {
      const uPad = ''.padEnd(rPad.length + tab, tabPad)
      const uLine = `${uPad}${tabPrefix}${url}`
      child.$log.info(uLine)
    }
  }
}

function printPrefix (level, child) {
  const prefix = child[kTeamityRouterPrefix]
  if (prefix && prefix !== '') {
    const pPad = ''.padEnd((level + 1) * tab, tabPad)
    const pLine = `${pPad}${tabPrefix}prefix`
    child.$log.info(pLine)

    const uPad = ''.padEnd(pPad.length + tab, tabPad)
    const uLine = `${uPad}${tabPrefix}${prefix}`
    child.$log.info(uLine)
  }
}

function printChild (level, child) {
  const nPad = ''.padEnd(level * tab, tabPad)
  if (level === 0) {
    child.$log.info(`${nPad}[${child.$name}]`)
  } else {
    child.$log.info(`${nPad}${tabPrefix}[${child.$name}]`)
  }
  printArrays(level, child, child[kTeamityDecorates], 'decorates')

  printArrays(
    level,
    child,
    Object.keys(child[kTeamityReply]),
    'reply decorates'
  )

  printPrefix(level, child)
  printArrays(level, child, child[kTeamityRoutes], 'routes')

  const children = child[kTeamityChildren]
  children.forEach(child => {
    printChild(level + 1, child)
  })
}

function scopePrint () {
  printChild(0, this)
}

module.exports = function () {
  this.print = scopePrint.bind(this)
}
