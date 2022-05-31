// 这是vue-cli创建出来项目的配置文件
// 在vue-config.js这个配置文件中，可以对整个项目的打包、构建进行全局的配置
// webpack在进行打包的时候，底层用到了node.js
// 因此在vue.config.js配置文件中，可以导入并使用node.js中的核心模块
const path = require('path') // 导入node.js中专门操作路径的模块
// __dirname是node环境下全局内置变量
const themePath = path.join(__dirname, './src/style/cover.less')

// 使用 @vue/cli-service 提供的 defineConfig 帮手函数，以获得更好的类型提示：
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  // 支持开发完成的项目用file协议或LiveServer插件打开,  设置为 './' 或 ''
  publicPath: './', // 告诉webpack打包的index.html引入其它资源文件以./开头(隔壁)
  // 定制主题
  css: {
    loaderOptions: {
      less: {
        // 若 less-loader 版本小于 6.0，请移除 lessOptions 这一级，直接配置选项。
        lessOptions: {
          modifyVars: {
            // 直接覆盖变量(了解即可，实际开发不用)
            // 缺点：每次需要重启服务器
            // 'nav-bar-background-color': 'red'
            // 或者可以通过 less 文件覆盖（文件路径为绝对路径,从盘符开始的路径，比如c:\\Users\\）
            hack: `true; @import "${themePath}";` // 使用模板字符串 ${}占位符
          }
        }
      }
    }
  }
})
