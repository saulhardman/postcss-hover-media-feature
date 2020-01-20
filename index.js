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

function parseSelector (selectors) {
  return selectorParser(group => {
    let hoverSelectors = selectorParser.root()
    let nonHoverSelectors = group.clone()

    group.walkPseudos(pseudo => {
      if (pseudo.value === ':hover') {
        hoverSelectors.append(pseudo.parent)
      }
    })

    nonHoverSelectors.walkPseudos(pseudo => {
      if (pseudo.value === ':hover') {
        pseudo.parent.remove()
      }
    })

    return [hoverSelectors, nonHoverSelectors]
  }).transformSync(selectors, { lossless: false })
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
