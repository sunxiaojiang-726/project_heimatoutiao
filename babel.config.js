module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  // 配置vant组件库按需加载
  plugins: [
    [
      'import',
      {
        libraryName: 'vant',
        libraryDirectory: 'es',
        // 指定Less样式源文件
        style: (name) => `${name}/style/less`
      },
      'vant'
    ]
  ]
}
