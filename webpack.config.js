/**
 * Extends the @wordpress/scripts webpack config so SVGs imported from JS
 * are always React components (via @svgr/webpack), regardless of the
 * wp-scripts version's default SVG handling.
 *
 * Place in the plugin root, next to package.json, then restart `npm start`.
 */
const path = require("path");
const defaultConfig = require("@wordpress/scripts/config/webpack.config");

// The default rule that handles `import x from './file.svg'` in JS/TS files.
const isJsSvgRule = (rule) =>
	rule &&
	rule.test instanceof RegExp &&
	rule.test.test("file.svg") &&
	rule.issuer instanceof RegExp &&
	rule.issuer.test("file.js");

const svgComponentRule = {
	test: /\.svg$/,
	issuer: /\.[jt]sx?$/,
	use: [
		{
			loader: "@svgr/webpack",
			options: {
				// Keep the SVG exactly as authored so the editor matches the
				// markup render.php inlines on the front end.
				svgo: false,
			},
		},
	],
};

const extend = (config) => ({
	...config,
	module: {
		...config.module,
		rules: [
			...config.module.rules.filter((rule) => !isJsSvgRule(rule)),
			svgComponentRule,
		],
	},
});

// wp-scripts exports an array when --experimental-modules is used.
module.exports = Array.isArray(defaultConfig)
	? defaultConfig.map(extend)
	: extend(defaultConfig);

// Silence "path is unused" linters if you don't need it elsewhere.
void path;
