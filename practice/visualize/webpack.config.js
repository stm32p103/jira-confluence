module.exports = {
  target: "web",
	mode: "production",
	entry: "./index.ts",
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
	externals: [
		{
      'jquery': true
		}
	]
};
