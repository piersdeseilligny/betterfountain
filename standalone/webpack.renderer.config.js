const rules = require('./webpack.rules');
const plugins = require('./webpack.plugins');
const path = require('path');

rules.push({
  test: /\.css$/,
  use: ['style-loader', 'css-loader']
}, {
  test: /\.html$/i,
  use: 'raw-loader'
},
{
  test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
  use: [{
    loader: 'file-loader',
    options: {
      name: '[name].[ext]',
      outputPath: 'fonts/'
    }
  }],
});

module.exports = {
  /*entry: {
    'avenue.worker': path.resolve(__dirname, './src/avenue/avenue.worker.ts')
  },*/
  output: {
    globalObject: 'self',
    filename: '[name].bundle.js'
  },
  module: {
    rules,
  },
  plugins: plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css']
  },
};