const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'webworker',
  entry: './src/extension.ts',
  output: {
    filename: 'extension.js',
    path: path.resolve(__dirname, 'out/web'),
    libraryTarget: 'commonjs'
  },
  resolve: {
    alias: {
      pdfkit$: path.resolve(__dirname, 'node_modules/pdfkit/js/pdfkit.standalone.js'),
      './telemetry$': path.resolve(__dirname, 'src/telemetry.web.ts')
    },
    extensions: ['.ts', '.js'],
    mainFields: ['browser', 'module', 'main'],
    fallback: {
      fs: false,
      child_process: false,
      perf_hooks: false,
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
      stream: require.resolve('stream-browserify'),
      util: require.resolve('util/')
    }
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_modules/,
      use: [{ loader: 'ts-loader', options: { transpileOnly: true } }]
    }]
  },
  externals: { vscode: 'commonjs vscode' },
  plugins: [
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'], process: 'process/browser' }),
    new webpack.IgnorePlugin({ resourceRegExp: /^font-finder$/ }),
    new webpack.IgnorePlugin({ resourceRegExp: /^username$/ })
  ],
  performance: { hints: false },
  devtool: 'nosources-source-map'
};
