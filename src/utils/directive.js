// 对Vue的全局自定义指令进行封装
// 封装中间件函数插件
const directiveObj = {
  install(Vue) {
    // 创建全局自定义指令
    Vue.directive('fofo', {
      // inserted()：指令所在标签，被插入到真实DOM时才触发，如果标签用dispaly:none隐藏再出现，不会再触发inserted的
      inserted(el) {
        fn(el)
      },
      // updated()：指令所在标签，被更新时触发(比如隐藏再出现)
      update(el) {
        fn(el)
      }
    })
  }
}

function fn(el) {
  if (el.nodeName === 'INPUT' || el.nodeName === 'TEXTAREA') {
    // 知识点: DOM.nodeName 拿到标签名字(注意: 大写的字符串)
    // 如果el本身是个原生的 textarea 或 input 标签,则直接调focus()
    el.focus()
  } else {
    // el本身不是输入框,尝试往里获取一下
    // 指令所在van-search组件,而组件根标签是个div,input在内部(现在要拿到input来聚焦)
    // 以上都是原生标签对象
    const theInput = el.querySelector('input')
    const theTextarea = el.querySelector('textarea')
    if (theInput) {
      theInput.focus()
    }
    if (theTextarea) {
      theTextarea.focus()
    }
  }
}

export default directiveObj
