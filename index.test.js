import postcss from 'postcss'

import plugin from './'

async function run (input, output, opts = {}) {
  let result = await postcss([plugin(opts)]).process(input, {
    from: undefined
  })

  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

describe('basic usage', () => {
  it('works with a single selector', async () => {
    await run(
      '.this-is-a-class:hover {}',
      '@media (hover: hover) {.this-is-a-class:hover {}}'
    )
  })

  it('works with descendant selectors', async () => {
    await run(
      '.s-some-scope p a:hover {}',
      '@media (hover: hover) {.s-some-scope p a:hover {}}'
    )
  })

  it('works with multiple selectors', async () => {
    await Promise.all([
      run(
        '.this-is-a-class:hover, .banana {}',
        [
          '.banana {}',
          '@media (hover: hover) {.this-is-a-class:hover {}}'
        ].join('')
      ),
      run(
        '.this-is-a-class:hover, .banana:hover {}',
        '@media (hover: hover) {.this-is-a-class:hover,.banana:hover {}}'
      )
    ])
  })

  it('skips rules contained within `@media (hover: hover) {}`', async () => {
    await Promise.all([
      run(
        '@media (hover: hover) {.btn:hover {}}',
        '@media (hover: hover) {.btn:hover {}}'
      ),
      run(
        '.p-index { @media (hover: hover) {.btn:hover {}} }',
        '.p-index { @media (hover: hover) {.btn:hover {}} }'
      )
    ])
  })
})
