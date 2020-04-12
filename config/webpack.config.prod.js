const {smart} = require('webpack-merge');
const base = require('./webpack.config.base');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const OptimizeCssplugin = require('optimize-css-assets-webpack-plugin');
const webpack = require('webpack');

module.exports = smart(base, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    // 清空文件
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] // 不删除dll目录下的文件
    }),
    // 将抽离出来的css文件进行压缩
    new OptimizeCssplugin(),
    new webpack.DefinePlugin({
      DEV: JSON.stringify('production') //字符串
    })
  ]
});