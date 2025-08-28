const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    entry: './src/index.tsx',
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      clean: true,
      publicPath: '/',
    },
    
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.sass', '.scss', '.css'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    
    module: {
      rules: [
        // TypeScript files
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        
        // Sass modules (*.module.sass)
        {
          test: /\.module\.sass$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: {
                  localIdentName: isDevelopment 
                    ? '[name]__[local]--[hash:base64:5]' 
                    : '[hash:base64]',
                },
                sourceMap: isDevelopment,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  indentedSyntax: true, // Включаем indented syntax для .sass
                },
                sourceMap: isDevelopment,
              },
            },
          ],
        },
        
        // Global Sass files (*.sass, but not *.module.sass)
        {
          test: /\.sass$/,
          exclude: /\.module\.sass$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: false,
                sourceMap: isDevelopment,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sassOptions: {
                  indentedSyntax: true, // Включаем indented syntax для .sass
                },
                sourceMap: isDevelopment,
              },
            },
          ],
        },
        
        // Regular CSS files
        {
          test: /\.css$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
      ],
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
      }),
      
      ...(isDevelopment ? [] : [
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
        }),
      ]),
    ],
    
    devServer: {
      static: {
        directory: path.join(__dirname, 'public'),
      },
      historyApiFallback: true,
      hot: true,
      port: 3000,
      open: true,
      compress: true,
    },
    
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
    },
    
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  };
};
