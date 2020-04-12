const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const config = require('../public/config')[isDev ? 'dev' : 'build'];
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  // mode: isDev ? "development" : 'production',
  // devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map', // 生产环境下使用
  // 单页应用
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[hash:6].js',
    publicPath: '/'
  },
  //多页应用
  // entry: {
  //   index: './src/index.js',
  //   login: './src/login.js'
  // },
  // output: {
  //   path: path.resolve(__dirname, 'dist'),
  //   filename: '[name].[hash:6].js'
  // },
  //配置别名
  resolve: {
    // 引入文件可以省略后缀
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  "corejs": 3
                }
              ]
            ]
          }
        },
        exclude: /node_modules/
      }, 
      // loader的执行顺序: less-loader -> postcss-loader -> css-loader -> style-loader
      {
        test: /\.(le|c)ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: isDev,
              reloadAll: true
            }
          }, // 替换之前的style-loader
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: function() {
                return [
                  require('autoprefixer')({
                    "overrideBrowserslist": [
                      ">0.25%",
                      "not dead"
                    ]
                  })
                ]
              }
            }
          },
          'less-loader'
        ],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10240, // 资源大小小于10K,将资源转为base64，超过10k，将图片拷贝到dist目录
              esModule: false,
              name: '[name]_[hash:6].[ext]',
              outputPath: 'assets'
            }
          }
        ],
        exclude: /node_modules/
      },
      // 使用html-withimg-loader处理图片之后，html就不能使用vm，ejs的模板
      // {
      //   test: /.html$/,
      //   use: 'html-withimg-loader'
      // }
    ]
  },
  plugins: [
    // 单页应用
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      minify: {
        removeAttributeQuotes: false,
        collapseWhitespace: false
      },
      config: config.template
    }),
    // 多页应用
    // new HtmlWebpackPlugin({
    //   template: './public/index.html',
    //   filename: 'index.html',
    //   minify: {
    //     removeAttributeQuotes: false,
    //     collapseWhitespace: false
    //   },
    //   config: config.template,
    //   chunks: ['index'] // 只引入index的js文件
    // }),
    // new HtmlWebpackPlugin({
    //   template: './public/login.html',
    //   filename: 'login.html', //打包后的文件名
    //   chunks: ['login'] // 只引入login的js文件
    // }),
    // 静态资源拷贝
    new CopyWebpackPlugin([
      {
        from: 'public/js/*.js',
        to: path.resolve(__dirname, 'dist', 'js'),
        flatten: true // 只拷贝文件，不拷贝文件路径
      }
    ],
    {
      ignore: ['other.js'] // 不拷贝指定文件
    }),
    // 定义全局变量,减少不必要的import
    new webpack.ProvidePlugin({
      _map: ['lodash', 'map'],
      React: 'react',
      Vue: ['vue/dist/vue.esm.js', 'default']
    }),
    // 抽离css，单独生成css文件夹
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    })
  ]
};