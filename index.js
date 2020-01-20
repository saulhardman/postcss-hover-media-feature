import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

import { name } from './package.json'

const pluginName = name.split('/')[1]

const selectorRegExp = /:hover/gi

function createMediaQuery (rule) {
  let atRule = postcss.atRule({
    name: 'media',
    params: '(hover: hover)',
    source: rule.source
  })

  atRule.append(rule)

  return atRule
}

function parseSelector (selector) {
  return selectorParser(group => {
    let hoverSelector = selectorParser.root()
    let nonHoverSelector = group.clone()

    group.walkPseudos(pseudo => {
      if (pseudo.value === ':hover') {
        hoverSelector.append(pseudo.parent)
      }
    })

    nonHoverSelector.walkPseudos(pseudo => {
      if (pseudo.value === ':hover') {
        pseudo.parent.remove()
      }
    })

    return [hoverSelector, nonHoverSelector]
  }).transformSync(selector, { lossless: false })
}

function isAlreadyNested (rule) {
  let container = rule.parent

  while (container !== null && container.type !== 'root') {
    if (
      container.type === 'atrule' &&
      container.params.includes('hover: hover')
    ) {
      return true
    }

    container = container.parent
  }

  return false
}

export default postcss.plugin(pluginName, () => root => {
  root.walkRules(selectorRegExp, rule => {
    if (isAlreadyNested(rule)) {
      return
    }

    let [hoverSelector, nonHoverSelector] = parseSelector(rule.selector)
    let mediaQuery = createMediaQuery(rule.clone({ selector: hoverSelector }))

    rule.after(mediaQuery)

    if (nonHoverSelector.length) {
      rule.replaceWith(rule.clone({ selector: nonHoverSelector }))

      return
    }

    rule.remove()
  })
})
