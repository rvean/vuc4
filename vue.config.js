const path = require('path')
const resolve = dir => path.join(__dirname, dir)
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

const CompressionWebpackPlugin = require('compression-webpack-plugin')  // gzip 压缩
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i  // gzip 压缩格式

module.exports = {
  publicPath: process.env.BASE_URL,
  productionSourceMap: false,  // 生产环境的 source map
  lintOnSave: true,  // 保存时进行 ESLint 检查
  devServer: {
    port: 8040,  // 端口
    open: false  // 自动打开浏览器
  },
  chainWebpack: config => {
    // 添加别名 alias
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@assets', resolve('src/assets'))
      .set('@components', resolve('src/components'))
      .set('@views', resolve('src/views'));

    // 图片压缩
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        mozjpeg: { progressive: true, quality: 65 },
        optipng: { enabled: false },
        pngquant: { quality: [0.65, 0.9], speed: 4 },
        gifsicle: { interlaced: false },
        webp: { quality: 75 }
      });
  },
  configureWebpack: config => {
    const plugins = [];

    if (IS_PROD) {
      // 开启 gzip 压缩
      plugins.push(
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: productionGzipExtensions,  // 所有匹配此{RegExp}的文件都会被处理
          threshold: 10240,  // 只处理大于此大小的文件，以字节为单位
          minRatio: 0.8  // 压缩比率
        })
      );
    }

    config.plugins = [...config.plugins, ...plugins];
  },
  pwa: {
    // 修改 favicon
    iconPaths: {
      favicon32: 'favicon.ico',
      favicon16: 'favicon.ico',
      appleTouchIcon: 'favicon.ico',
      maskIcon: 'favicon.ico',
      msTileImage: 'favicon.ico',
    },
  },
  css: {
    loaderOptions: {
      sass: {
        prependData: `
					@import '@/styles/index.scss';
				`,
      },
    },
  },
}