const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = [
  new ForkTsCheckerWebpackPlugin(),
  new MonacoWebpackPlugin({

  }),
  new CopyWebpackPlugin({
    patterns:[{
      from:path.resolve(__dirname, 'src','renderer','static'),
      to: path.resolve(__dirname, '.webpack/renderer/static')
    }]
  })
];
