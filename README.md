# PostCSS Hover Media Feature

[PostCSS](https://github.com/postcss/postcss) PostCSS plugin that extracts and
wraps rules containing `:hover` pseudo-classes in `@media (hover: hover) {}`
media queries

```css
.foo:hover {
  /* Input example */
}
```

```css
@media (hover: hover) {
  .foo:hover {
    /* Output example */
  }
}
```

## Usage

Check you project for existed PostCSS config: `postcss.config.js` in the project
root, `"postcss"` section in `package.json` or `postcss` in bundle config.

If you already use PostCSS, add the plugin to plugins list:

```diff
module.exports = {
  plugins: [
+   require('postcss-hover-media-feature'),
    require('autoprefixer')
  ]
}
```

If you do not use PostCSS, add it according to
[official docs](https://github.com/postcss/postcss#usage) and set this plugin in
settings.
