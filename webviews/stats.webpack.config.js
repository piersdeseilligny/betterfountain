const path = require('path');
const webpack = require("webpack");

module.exports = {
  entry: './webviews/src/stats.js',
  output: {
    path: path.resolve(__dirname, 'out'),
    filename: 'stats.bundle.js',
    hashFunction: "xxhash64"
  },
  optimization: {
    minimize: false
  },
  module:{
    rules:[
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      }
    ]
  },
  plugins:[
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery:"jquery"
    })
  ],
  devtool: 'eval-cheap-source-map'
};