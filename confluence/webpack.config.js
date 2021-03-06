const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
module.exports = {
	mode: "development",
	entry: "./index.tsx",
	output: {
		filename: "index.js"
	},
	resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
		extensions: [".ts", ".tsx", ".js", "json" ]
	},
	module: {
		rules: [
			// all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
			{ test: /\.tsx?$/, loader: "ts-loader" },
			{ test: /\.css/, loader: "css-loader" },
			{ test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/, loader: "url-loader" }
		]
	},
	optimization: {
		minimizer: [ new UglifyJsPlugin() ],
	},
	externals: [
		{
//      'jquery': true
		}
	]
};
