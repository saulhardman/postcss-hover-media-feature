module.exports = ({
  fallback = false,
  fallbackSelector = 'html:not(.supports-touch)',
  rootSelectors = []
} = {}) => {
  function createMediaQuery (rule, { AtRule }) {
    let media = new AtRule({ name: 'media', params: '(hover: hover)' })

    media.source = rule.source

    media.append(rule)

    return media
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

  return {
    postcssPlugin: 'postcss-hover-media-feature',

    Rule (rule, { AtRule }) {
      if (
        !rule.selector.includes(':hover') ||
        isAlreadyNested(rule) ||
        rule.selector.includes(fallbackSelector)
      ) {
        return
      }

      let [hoverSelectorList, nonHoverSelectorList] = parseSelector(
        rule.selector
      )
      let mediaQuery = createMediaQuery(
        rule.clone({ selectors: hoverSelectorList }),
        { AtRule }
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
                return `${fallbackSelector}${hoverSelector}`
              }
              return `${fallbackSelector} ${hoverSelector}`
            })
          })
        )
      }

      if (nonHoverSelectorList.length) {
        rule.replaceWith(rule.clone({ selectors: nonHoverSelectorList }))

        return
      }

      rule.remove()
    }
  }
}

module.exports.postcss = true
