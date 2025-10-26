const path = require('path');
const webpack = require('webpack');
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
                api: 'modern',
                sassOptions: {
                  indentedSyntax: true, // Включаем indented syntax для .sass
                  silenceDeprecations: ['legacy-js-api'],
                  includePaths: [path.resolve(__dirname, 'src')],
                },
                webpackImporter: true,
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
                api: 'modern',
                sassOptions: {
                  indentedSyntax: true, // Включаем indented syntax для .sass
                  silenceDeprecations: ['legacy-js-api'],
                  includePaths: [path.resolve(__dirname, 'src')],
                },
                webpackImporter: true,
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

      // Определяем переменные окружения для браузера
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
        'process.env.REACT_APP_API_HOST': JSON.stringify(process.env.REACT_APP_API_HOST || 'https://api.casalabia.dev'),
        'process.env.REACT_APP_INTERNAL_API_HOST': JSON.stringify(process.env.REACT_APP_INTERNAL_API_HOST || 'http://ai-realtor-backend.railway.internal:8080'),
        'process.env.REACT_APP_API_PREFIX': JSON.stringify(process.env.REACT_APP_API_PREFIX || '/api/v1'),
        'process.env.REACT_APP_ADMIN_USERNAME': JSON.stringify(process.env.REACT_APP_ADMIN_USERNAME || 'test'),
        'process.env.REACT_APP_ADMIN_PASSWORD': JSON.stringify(process.env.REACT_APP_ADMIN_PASSWORD || 'nicecock99'),
      }),
      
      ...(isDevelopment ? [] : [
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
        }),
      ]),

      // Копируем _redirects файл для Railway
      ...(isDevelopment ? [] : [{
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CopyRedirects', () => {
            const fs = require('fs');
            const path = require('path');
            const redirectsSource = path.resolve(__dirname, 'public/_redirects');
            const redirectsTarget = path.resolve(__dirname, 'dist/_redirects');
            if (fs.existsSync(redirectsSource)) {
              fs.copyFileSync(redirectsSource, redirectsTarget);
            }
          });
        }
      }]),
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

    performance: {
        hints: isDevelopment ? false : 'warning',
        maxAssetSize: 1024 * 1024, // 1MB
        maxEntrypointSize: 1024 * 1024, // 1MB
    },
    
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  };
};
