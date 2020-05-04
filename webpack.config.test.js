const glob = require("glob");
const path = require( 'path' );

module.exports = {
  context: __dirname,
  entry: glob.sync(__dirname + "/src/tests/*.js"),
  output: {
    path: __dirname + '/test_output/',
    filename: 'test_main.js',
  },
  devtool: 'sourcemap',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: path.resolve(__dirname, 'node_modules/pixi.js'),
        loader: 'transform-loader?brfs',
      }
    ],
  },
  mode: 'development'
};
