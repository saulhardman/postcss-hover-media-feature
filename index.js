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

  return [
    selectorList.filter(s => s.includes(':hover')),
    selectorList.filter(s => !s.includes(':hover'))
  ]
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

export default postcss.plugin(
  pluginName,
  ({
    fallback = false,
    fallbackSelector = 'html:not(.supports-touch)',
    rootSelectors = []
  } = {}) => root => {
    root.walkRules(selectorRegExp, rule => {
      if (isAlreadyNested(rule)) {
        return
      }

      let [hoverSelectorList, nonHoverSelectorList] = parseSelector(
        rule.selector
      )
      let mediaQuery = createMediaQuery(
        rule.clone({ selectors: hoverSelectorList })
      )

      rule.after(mediaQuery)

      if (fallback) {
        rule.before(
          rule.clone({
            selectors: hoverSelectorList.map(hoverSelector => {
              if (
                rootSelectors.some(rootSelector =>
                  hoverSelector.startsWith(rootSelector)
                )
              ) {
                return `${ fallbackSelector }${ hoverSelector }`
              }
              return `${ fallbackSelector } ${ hoverSelector }`
            })
          })
        )
      }

      if (nonHoverSelectorList.length) {
        rule.replaceWith(
          rule.clone({ selectors: nonHoverSelectorList })
        )

        return
      }

      rule.remove()
    })
  }
)
