const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
	mode: "production",
	entry: "./lib/content-property.ts",
	output: {
		filename: "confluence-lib.js",
	    library: 'ConfluenceLib',
	    libraryTarget: 'commonjs2'
	},
	resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".ts", ".tsx", ".js", "json" ]
	},
	module: {
		rules: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.tsx?$/, loader: "ts-loader", options: { configFile: "tsconfig.lib.json" } }
		]
	},
	optimization: {
		minimizer: [ new UglifyJsPlugin() ],
	},
	externals: [
		{
			'jquery': true,
			'react': true
		}
	]
};
