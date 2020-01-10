const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
//const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

//const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

//const smp = new SpeedMeasurePlugin();
//module.exports = smp.wrap( (env, args) => {
module.exports = (env, args) => {

  var isProductionMode = ( args.mode === "production" );
  
  return ({
  entry: path.join(__dirname, "src", "index.ts"),
  devtool: isProductionMode ? '' : 'inline-source-map',
  output: {
    path: path.join(__dirname, "build"),
    filename: isProductionMode ? '[name].[contenthash].js' : '[name].[hash].js',
  },
  module: {
    rules: [
      {
        type: 'javascript/auto',
        test: /\.(json)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
        ],
      },
      {
        test: /.(ts|tsx|js|jsx)$/,
        loader: require.resolve('babel-loader'),
        //exclude: /node_modules/,
        include: path.resolve(__dirname, 'src'),
        options: {
          cacheDirectory: true,
        },
      },
      {
        test: /.(css|scss)$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /.(jpg|jpeg|png|gif|mp3|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
        ]
      },
      {
        test: /favicon.ico$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: "[path][name]-[hash:8].[ext]"
            }
          } 
        ],
      },
    ],
  },
  resolve: { extensions: [".ts",".tsx",".js",".jsx"] },
  devServer: {
    contentBase: './dist',
         hot: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.join(__dirname, "src", "index.html")
    }),
    new MiniCssExtractPlugin({
      filename:  "[name].[contenthash].css",
      chunkFilename: "[id].css"
    }),
    //new BundleAnalyzerPlugin()
  ],
  optimization: isProductionMode ? {
    //runtimeChunk: 'single',
    splitChunks: {
       cacheGroups: {
          commons: {test: /[\\/]node_modules[\\/]/, name: "vendors", chunks: "all"}
        }
     }
  }
  : {}
})

};