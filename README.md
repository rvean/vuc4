<h1 align="center">Vue-cli4 配置</h1>

## 目录

- [配置环境变量](#env)
- [配置基础 vue.config.js](#base)
- [配置 proxy 跨域](#proxy)
- [修复 HMR(热更新)失效](#hmr)
- [修复 Lazy loading routes Error](#lazyloading)
- [添加别名 alias](#alias)
- [添加打包分析](#analyz)
- [去掉 console.log](#log)
- [开启 gzip 压缩](#gzip)
- [压缩图片](#compressimg)
- [自动生成雪碧图](#spritesmith)
- [配置 externals 引入 cdn](#externals)
- [添加 IE 兼容](#ie)
- [文件上传 oss](#oss)
- [配置 less 全局变量](#less)
- [配置 sass 全局变量](#sass)
- [多页面打包 multi-page](#multi)

******

### <span id="env">配置环境变量</span>

&emsp; 通过在 package.json 里的 scripts 配置项中添加 --mode xxx 来选择不同环境

&emsp; 只有以 VUE_APP_ 开头的变量会被 webpack.DefinePlugin 静态嵌入到客户端侧的包中。你可以在应用的代码中这样访问它们：
```js
console.log( process.env.VUE_APP_SECRET )
```

&emsp; NODE_ENV 和 BASE_URL 是两个特殊变量，在应用代码中始终可用

***配置：***

&emsp; 在项目根目录中新建 .env, .env.production, .env.analyz 等文件

+ .env - serve 默认的本地开发环境配置

```js
NODE_ENV = 'development'
VUE_APP_BASEURL = '本地开发api地址'
```

+ .env.production - build 默认的环境配置

```js
NODE_ENV = 'production'
VUE_APP_BASEURL = '正式环境api地址'
```

+ .env.analyz - 自定义环境配置，用于打包分析

```js
NODE_ENV = 'production'
IS_ANALYZ = true
VUE_APP_BASEURL = '正式环境api地址'
```

+ package.json 修改

```js
"scripts": {
  "serve": "vue-cli-service serve",
  "build": "vue-cli-service build",
  "lint": "vue-cli-service lint",
  "analyz": "vue-cli-service build --mode analyz"
}
```

[↑ 返回目录 ↑](#目录)

### <span id="base">配置基础 vue.config.js</span>

```js
module.exports = {
  publicPath: './', // 默认'/'，部署应用包时的基本 URL
  outputDir: process.env.outputDir || 'dist', // 'dist', 生产环境构建文件的目录
  assetsDir: '', // 相对于 outputDir 的静态资源(js、css、img、fonts)目录
  lintOnSave: true, // 每次保存时 lint 代码
  productionSourceMap: false,  // 生产环境的 source map
  devServer: {
    port: 8030,  // 端口
    open: false  // 是否自动打开浏览器
  },
}
```

[↑ 返回目录 ↑](#目录)

### <span id="proxy">配置 proxy 跨域</span>

```js
module.exports = {
  devServer: {
    // overlay: { // 当出现编译错误或警告时，在浏览器中显示全屏覆盖层
    //   warnings: true,
    //   errors: true
    // },
    open: false, // 是否自动打开浏览器
    host: "localhost",
    port: "8008", // 端口号
    https: false,
    proxy: {
      '/api': {
        target: 'https://other-server.example.com', // 目标代理接口地址
        secure: false, // 不检查 https 证书
        changeOrigin: true, // 开启代理，在本地创建一个虚拟服务端
        ws: true, // 是否启用 websockets
        pathRewrite: {'^/api' : '/'}
      }
    }
  },
}
```

+ 访问

```js
<script>
import axios from "axios"
export default {
  mounted() {
    axios.get("/api/1").then(res => {
      console.log(res)
    })
  }
}
</script>
```

[↑ 返回目录 ↑](#目录)

### <span id="hmr">修复 HMR(热更新)失效</span>

```js
module.exports = {
  chainWebpack: config => {
    config.resolve.symlinks(true)
  }
}
```

[↑ 返回目录 ↑](#目录)

### <span id="lazyloading">修复 Lazy loading routes Error：Cyclic dependency</span>

```js
module.exports = {
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].chunksSortMode = 'none'
      return args
    })
  }
}
```

[↑ 返回目录 ↑](#目录)

### <span id="alias">添加别名 alias</span>

```js
const path = require('path')
const resolve = dir => path.join(__dirname, dir)

module.exports = {
  chainWebpack: config => {
    // 添加别名 alias
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@assets', resolve('src/assets'))
      .set('@components', resolve('src/components'))
      .set('@views', resolve('src/views'))
  }
}
```

[↑ 返回目录 ↑](#目录)

### <span id="analyz">添加打包分析</span>

```bash
npm i -D webpack-bundle-analyzer
```

```js
module.exports = {
  chainWebpack: config => {
    // 打包分析  npm run analyz
    if (process.env.IS_ANALYZ) {
      config.plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }
  }
}
```

+ 需要添加 .env.analyz 文件
```js
NODE_ENV = 'production'
IS_ANALYZ = true
```

+ 需要在 package.json 的 scripts 中添加

```js
"analyz": "vue-cli-service build --mode analyz"
```

+ 执行 - 打包完成会自动打开浏览器

```bash
npm run analyz
```

[↑ 返回目录 ↑](#目录)

### <span id="log">去掉 console.log</span>

+ **方法一：使用 terser-webpack-plugin 插件**

```bash
npm i -D terser-webpack-plugin
```

在 vue.config.js 中配置

```js
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

module.exports = {
  configureWebpack: config => {
    if (IS_PROD) {
      // 正式环境打包的时候去掉 console.log   需安装 terser-webpack-plugin
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
  }
}
```

+ **方法二：使用 babel-plugin-transform-remove-console 插件**

```bash
npm i -D babel-plugin-transform-remove-console
```

在 babel.config.js 中配置

```js
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
const plugins = []

if (IS_PROD) {
  plugins.push("transform-remove-console")
}

module.exports = {
  presets: ["@vue/app", { useBuiltIns: "entry" }],
  plugins
}
```

[↑ 返回目录 ↑](#目录)

### <span id="gzip">开启 gzip 压缩</span>

```bash
npm i -D compression-webpack-plugin
```

```js
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

const CompressionWebpackPlugin = require('compression-webpack-plugin')  // gzip 压缩
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i  // gzip 压缩格式

module.exports = {
  configureWebpack: config => {
    const plugins = []
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
      )
    }
    config.plugins = [...config.plugins, ...plugins]
  }
}
```

[↑ 返回目录 ↑](#目录)

### <span id="compressimg">压缩图片</span>

```bash
npm i -D image-webpack-loader
# 如果 npm 不行，就用 cnpm
cnpm i -D image-webpack-loader
```

```js
module.exports = {
  chainWebpack: config => {
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
      })
  }
}
```

[↑ 返回目录 ↑](#目录)

### <span id="spritesmith">自动生成雪碧图</span>

```bash
npm i -D webpack-spritesmith
```

```js
const path = require('path')
const resolve = dir => path.join(__dirname, dir)
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)

let need_sprite = true  // 是否需要生成雪碧图

const SpritesmithPlugin = require('webpack-spritesmith')
// 雪碧图样式模板
const SpritesmithTemplate = data => {
  let icons = `.icon { display: inline-block; vertical-align: middle; background-image: url(${data.sprites[0].image}) }`

  let perSprite = data.sprites.map(sp => {
    return `.icon-${sp.name} { width: ${sp.width}px; height: ${sp.height}px; background-position: ${sp.offset_x}px ${sp.offset_y}px; }`
  }).join("\n")

  return icons + "\n" + perSprite
}

module.exports = {
  configureWebpack: config => {
    const plugins = []
    if (need_sprite) {
      plugins.push(
        new SpritesmithPlugin({
          src: {
            cwd: path.resolve(__dirname, "./src/assets/images/icons/"),  // 要创建雪碧图的源文件夹
            glob: "*.png"  // 要创建雪碧图的源文件类型
          },
          target: {
            image: path.resolve(__dirname, "./src/assets/images/sprite.png"),  // 生成的雪碧图路径和文件名
            css: [
              [
                path.resolve(__dirname, "./src/assets/scss/sprite.scss"),  // 引用生成的雪碧图的样式文件的路径
                {
                  format: "function_based_template"  // 引用自己的模板
                }
              ]
            ]
          },
          apiOptions: {
            cssImageRef: "../images/sprite.png"  // 配置在样式文件中引用雪碧图的路径
          },
          customTemplates: {
            function_based_template: SpritesmithTemplate  // 配置生成样式文件的样式模板
          },
          spritesmithOptions: {
            algorithm: "binary-tree",  // 排列算法 top-down、left-right、diagonal、alt-diagonal、binary-tree
            padding: 8
          }
        })
      )
    }

    config.plugins = [...config.plugins, ...plugins]
  }
}
```

+ 默认 src/assets/images/icons 文件夹中存放需要生成雪碧图的 .png 图片，运行 `npm run serve` 会在 src/assets/images 生成 sprite.png 雪碧图

> ##### 实现生成 icons.json 文件，再次运行命令时，会对比 icons 目录内文件与 icons.json 的匹配关系，确定是否需要再次执行 webpack-spritesmith 插件

```js
const SpritesmithPlugin = require('webpack-spritesmith')
const path = require('path')
const fs = require('fs')
let has_sprite = true

// 对比 icons.json 判断是否需要生成雪碧图
try {
  let result = fs.readFileSync(path.resolve(__dirname, './icons.json'), 'utf8')
  result = JSON.parse(result)
  const files = fs.readdirSync(path.resolve(__dirname, './src/assets/images/icons'))
  has_sprite =
    files && files.length
      ? files.some(item => {
          let filename = item.toLocaleLowerCase().replace(/_/g, '-')
          return !result[filename]
        })
      : false
} catch (e) {
  has_sprite = false
}

// 雪碧图样式处理模板
const SpritesmithTemplate = data => {
  let icons_json = {}
  let icons = `.icon { display: inline-block; vertical-align: middle; background-image: url(${data.sprites[0].image}) }`

  let perSprite = data.sprites.map(sp => {
    const name = '' + sp.name.toLocaleLowerCase().replace(/_/g, '-')
    icons_json[`${name}.png`] = true
    return `.icon-${sp.name} { width: ${sp.width}px; height: ${sp.height}px; background-position: ${sp.offset_x}px ${sp.offset_y}px; }`
  }).join("\n")

  // 生成 icons.json
  fs.writeFile(
    path.resolve(__dirname, './icons.json'),
    JSON.stringify(icons_json, null, 2),
    (err, data) => {}
  )

  return icons + "\n" + perSprite
}

module.exports = {
  configureWebpack: config => {
    const plugins = []
    if (need_sprite) {
      plugins.push(
        new SpritesmithPlugin({
          src: {
            cwd: path.resolve(__dirname, "./src/assets/images/icons/"),  // 要创建雪碧图的源文件夹
            glob: "*.png"  // 要创建雪碧图的源文件类型
          },
          target: {
            image: path.resolve(__dirname, "./src/assets/images/sprite.png"),  // 生成的雪碧图路径和文件名
            css: [
              [
                path.resolve(__dirname, "./src/assets/scss/sprite.scss"),  // 引用生成的雪碧图的样式文件的路径
                {
                  format: "function_based_template"  // 引用自己的模板
                }
              ]
            ]
          },
          apiOptions: {
            cssImageRef: "../images/sprite.png"  // 配置在样式文件中引用雪碧图的路径
          },
          customTemplates: {
            function_based_template: SpritesmithTemplate  // 配置生成样式文件的样式模板
          },
          spritesmithOptions: {
            algorithm: "binary-tree",  // 排列算法 top-down、left-right、diagonal、alt-diagonal、binary-tree
            padding: 8
          }
        })
      )
    }

    config.plugins = [...config.plugins, ...plugins]
  }
}
```

[↑ 返回目录 ↑](#目录)

### <span id="externals">配置 externals 引入 cdn 资源</span>

防止将某些 import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖

```js
module.exports = {
  configureWebpack: config => {
    config.externals = {
      'vue': 'Vue',
      'element-ui': 'ELEMENT',
      'vue-router': 'VueRouter',
      'vuex': 'Vuex',
      'axios': 'axios'
    }
  },
  chainWebpack: config => {
    const cdn = {
      css: ['//unpkg.com/element-ui@2.10.1/lib/theme-chalk/index.css'],
      js: [
        '//unpkg.com/vue@2.6.10/dist/vue.min.js',
        '//unpkg.com/vue-router@3.0.6/dist/vue-router.min.js',
        '//unpkg.com/vuex@3.1.1/dist/vuex.min.js',
        '//unpkg.com/axios@0.19.0/dist/axios.min.js',
        '//unpkg.com/element-ui@2.10.1/lib/index.js'
      ]
    }

    // html 中添加 cdn
    config.plugin('html').tap(args => {
      args[0].cdn = cdn
      return args
    })
  }
}
```

+ 在 index.html 中添加

```html
<!-- 使用CDN的CSS文件 -->
<% for (var i in htmlWebpackPlugin.options.cdn && htmlWebpackPlugin.options.cdn.css) { %>
<link rel="stylesheet" href="<%= htmlWebpackPlugin.options.cdn.css[i] %>" />
<% } %>

<!-- 使用CDN的JS文件 -->
<% for (var i in htmlWebpackPlugin.options.cdn && htmlWebpackPlugin.options.cdn.js) { %>
<script src="<%= htmlWebpackPlugin.options.cdn.js[i] %>"></script>
<% } %>
```

[↑ 返回目录 ↑](#目录)

### <span id="ie">添加 IE 兼容</span>

```bash
npm i -S @babel/polyfill
```

+ 在 main.js 中添加

```js
import '@babel/polyfill'
```

+ 配置 babel.config.js

```js
const plugins = []

module.exports = {
  presets: [['@vue/app', { useBuiltIns: 'entry' }]],
  plugins
}
```

[↑ 返回目录 ↑](#目录)

### <span id="oss">文件上传 ali oss</span>

+ 开启文件上传 ali oss，需要将 publicPath 改成 ali oss 资源 url 前缀，也就是修改 .env.production 文件的 VUE_APP_PUBLIC_PATH

```bash
npm i -D webpack-oss
```

```js
const pev = process.env
const IS_PROD = ['production', 'prod'].includes(pev.NODE_ENV)
const AliOssPlugin = require('webpack-oss')
const format = AliOssPlugin.getFormat()

module.exports = {
  publicPath: IS_PROD ? `${pev.VUE_APP_PUBLIC_PATH}/${format}` : './', // 默认'/'，部署应用包时的基本 URL
  configureWebpack: config => {
    const plugins = []

    if (IS_PROD && pev.ACCESS_KEY_ID && pev.ACCESS_KEY_SECRET && pev.REGION && pev.BUCKET && pev.PREFIX) {
      plugins.push(
        new AliOssPlugin({
          accessKeyId: pev.ACCESS_KEY_ID,
          accessKeySecret: pev.ACCESS_KEY_SECRET,
          region: pev.REGION,
          bucket: pev.BUCKET,
          prefix: pev.PREFIX,
          exclude: /.*\.html$/,
          format
        })
      )
    }
    
    config.plugins = [...config.plugins, ...plugins]
  }
}
```

+ .env.production 文件

```js
NODE_ENV = 'production'
VUE_APP_BASEURL = '正式环境api地址'
VUE_APP_PUBLIC_PATH = 'https://prod.oss.com/example'

ACCESS_KEY_ID = '2*************9'
ACCESS_KEY_SECRET = 'z************='
REGION = 'oss-cn-hangzhou'
BUCKET = 'staven'
PREFIX = 'nuxt-doc'
```

[↑ 返回目录 ↑](#目录)

### <span id="less">配置 less 全局变量</span>

+ 需要安装两个插件 style-resources-loader 和 vue-cli-plugin-style-resources-loader

```bash
npm i -D style-resources-loader vue-cli-plugin-style-resources-loader
```

```js
const path = require('path')

module.exports = {
  pluginOptions: {
    // less 全局样式/变量  variable.less 放置了全局样式/变量
    "style-resources-loader": {
      preProcessor: "less",      
      patterns: [path.resolve(__dirname, "./src/assets/less/variable.less")]
    }
  }
}
```

[↑ 返回目录 ↑](#目录)

### <span id="sass">配置 sass 全局变量</span>

```js
// variable.scss 放置全局变量
module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `@import "~@/assets/scss/variable.scss";`
      }
    }
  }
}
```

[↑ 返回目录 ↑](#目录)

### <span id="multi">多页配置</span>

多页面打包，建议在 src 目录下新建 pages 目录存放多页面模块。

+ pages.config.js
  - 配置多页面信息。src/main.js 文件对应 main 字段，其他根据参照 pages 为根路径为字段。如下：

```js
module.exports = {
  main: {
    template: "public/index.html",
    filename: "index.html",
    title: "主页",
    chunks: ["chunk-vendors", "chunk-common", "index"]
  },
  "pages/admin": {
    template: "public/index.html",
    filename: "admin.html",
    title: "后台管理",
    chunks: ["chunk-vendors", "chunk-common", "index"]
  },
  "pages/mobile": {
    template: "public/index.html",
    filename: "mobile.html",
    title: "移动端",
    chunks: ["chunk-vendors", "chunk-common", "index"]
  }
}
```

+ vue.config.js

```js
const glob = require("glob");
const pagesInfo = require("./pages.config");
const pages = {};

glob.sync("./src/**/main.js").forEach(p => {
  let result = p.match(/\.\/src\/(.*)\/main\.js/);
  result = result ? result[1] : "";
  const key = result ? result : "main";
  if (pagesInfo[key]) {
    pages[key] = {
      entry: result ? `src/${result}/main.js` : "src/main.js"
    };
    for (const info in pagesInfo[key]) {
      pages[key] = {
        ...pages[key],
        [info]: pagesInfo[key][info]
      };
    }
  }
});
module.exports = {
  pages,
  chainWebpack: config => {
    // 防止多页面打包卡顿
    config => config.plugins.delete("named-chunks");

    return config;
  }
};
```

+ 如果多页面打包需要使用 CDN，使用 vue inspect --plugins 查看 html 是否在结果数组中的形式。

```js
const path = require("path");
const resolve = dir => path.join(__dirname, dir);
const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);

const glob = require("glob");
const pagesInfo = require("./pages.config");
const pages = {};

glob.sync("./src/**/main.js").forEach(p => {
  let result = p.match(/\.\/src\/(.*)\/main\.js/);
  result = result ? result[1] : "";
  const key = result ? result : "main";
  if (pagesInfo[key]) {
    pages[key] = {
      entry: result ? `src/${result}/main.js` : "src/main.js"
    };
    for (const info in pagesInfo[key]) {
      pages[key] = {
        ...pages[key],
        [info]: pagesInfo[key][info]
      };
    }
  }
});

module.exports = {
  publicPath: IS_PROD ? process.env.VUE_APP_PUBLIC_PATH : "./", //
  configureWebpack: config => {
    config.externals = {
      vue: "Vue",
      "element-ui": "ELEMENT",
      "vue-router": "VueRouter",
      vuex: "Vuex",
      axios: "axios"
    };
  },
  chainWebpack: config => {
    const cdn = {
      // 访问https://unpkg.com/element-ui/lib/theme-chalk/index.css获取最新版本
      css: ["//unpkg.com/element-ui@2.10.1/lib/theme-chalk/index.css"],
      js: [
        "//unpkg.com/vue@2.6.10/dist/vue.min.js", // 访问https://unpkg.com/vue/dist/vue.min.js获取最新版本
        "//unpkg.com/vue-router@3.0.6/dist/vue-router.min.js",
        "//unpkg.com/vuex@3.1.1/dist/vuex.min.js",
        "//unpkg.com/axios@0.19.0/dist/axios.min.js",
        "//unpkg.com/element-ui@2.10.1/lib/index.js"
      ]
    };

    // 防止多页面打包卡顿
    config => config.plugins.delete("named-chunks");

    // 多页面cdn添加
    Object.keys(pagesInfo).forEach(page => {
      console.log(page);
      config.plugin(`html-${page}`).tap(args => {
        // html中添加cdn
        args[0].cdn = cdn;

        // 修复 Lazy loading routes Error
        args[0].chunksSortMode = "none";
        return args;
      });
    });
    return config;
  },
  pages
};
```

[↑ 返回目录 ↑](#目录)
