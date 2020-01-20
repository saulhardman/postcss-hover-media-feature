import postcss from 'postcss'

import { name } from './package.json'

const pluginName = name.split('/')[1]

const selectorRegExp = /:hover/gi

function createMediaQuery (rule) {
  let atRule = postcss.parse('@media (hover: hover) {}').first

  atRule.source = rule.source

  atRule.append(rule)

  return atRule
}

function parseSelector (selector) {
  let selectorList = selector.split(',').map(s => s.trim())

  let hoverSelector = selectorList.filter(s => s.includes(':hover')).join(',')
  let nonHoverSelector = selectorList.filter(s => !s.includes(':hover')).join(',')

  return [hoverSelector, nonHoverSelector]
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
