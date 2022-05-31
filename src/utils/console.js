// ·开发环境和生产环境是2套不同的环境。
// 开发环境下需要使用console.log，生产环境下不需要使用console.log。
// 让一套代码，在2个环境自动生效！
// Ndoe.js打包时执行main.js代码时，node内有全局内置变量process(固定的)。

// ·在服务器根目录下，可以新建环境变量配置文件(文件名固定)
// 脚手架环境webpack内置配好的，文件名(可以修改的但是要改配置——不修改即可)。
// .env.development
// .env.production

// ·在环境变量文件中，变量名NODE_ENV和BASE_URL(固定的)，自定义变量名VUE_APP_开头(规定)。
// key名必须一致，写代码一套代码.key名，会自动匹配环境变量值。

// ·运行npm run serve，.env.development内变量自动挂载到process.env属性上。
// 运行npm run build，.env.production内变量自动挂载到process.env属性上。

if (process.env.NODE_ENV !== 'development') {
  // process是Node环境全部变量, 运行时根据敲击的命令不同, 脚手架会取环境变量给env添加属性和值
  console.log = function () {} // 覆盖所有的console打印语句
  console.error = function () {}
  console.dir = function () {}
  console.warning = function () {}
}
