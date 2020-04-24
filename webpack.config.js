const path = require( 'path' );

module.exports = {
  context: __dirname,
  entry: './src/mainGlobal.js',
  output: {
    path: __dirname,
    filename: 'hitagi.js',
    globalObject: 'hitagi',
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
    ]
  },
  watch: true,
};
