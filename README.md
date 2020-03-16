# PostCSS Hover Media Feature

[PostCSS](https://github.com/postcss/postcss) PostCSS plugin that extracts and
wraps rules containing `:hover` pseudo-classes in `@media (hover: hover) {}`
media queries.

Certain mobile browsers apply `:hover` styles on 'tap', which (in most cases)
isn't desirable. By wrapping `:hover` styles with a
[Hover Media Feature](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover)
Media Query these styles will only be applied on devices that support them.

```css
.foo:hover {
  color: blue;
  text-decoration: underline;
}

/* becomes */

@media (hover: hover) {
  .foo:hover {
    color: blue;
    text-decoration: underline;
  }
}
```

## Usage

Check your project for an existing PostCSS config: `postcss.config.js` in the
project root, `"postcss"` section in `package.json` or `postcss` in bundle
config.

If you already use PostCSS, add the plugin to plugins list:

```diff
// postcss.config.js

+ const postcssHoverMediaFeature = require('postcss-hover-media-feature');

module.exports = {
  plugins: [
+   postcssHoverMediaFeature,
    require('autoprefixer')
  ]
}
```

If you do not use PostCSS, add it according to
[official docs](https://github.com/postcss/postcss#usage) and set this plugin in
settings.

## Options

### `fallback: false`

The `fallback` option provides a way to extend this functionality to browsers
that don't themselves support the Hover Media Feature. It prefixes rules whose
selectors contain the `:hover` pseudo-selector – only when this selector is also
matched will the hover styles apply.

```js
postcssHoverMediaFeature({ fallback: true }),
```

```css
.foo:hover {
  color: blue;
  text-decoration: underline;
}

/* becomes */

html:not(.supports-touch) .foo:hover {
  color: blue;
  text-decoration: underline;
}

@media (hover: hover) {
  .foo:hover {
    color: blue;
    text-decoration: underline;
  }
}
```

### `fallbackClassName: 'html:not(.supports-touch)'`

The `fallbackClassName` option only comes into play if `fallback` is set to
`true`. It dictates the class name that selectors containing `:hover`
pseudo-class selectors are prefixed with.

```js
postcssHoverMediaFeature({ fallback: true, fallbackClassName: '.supports-hover' }),
```

```css
.foo:hover {
  color: blue;
  text-decoration: underline;
}

/* becomes */

.supports-hover .foo:hover {
  color: blue;
  text-decoration: underline;
}

@media (hover: hover) {
  .foo:hover {
    color: blue;
    text-decoration: underline;
  }
}
```
