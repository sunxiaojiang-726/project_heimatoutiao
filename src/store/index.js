// 1. 导入 Vue 和 Vuex 的包
import Vue from 'vue'
import Vuex from 'vuex'

// 2. 调用Vue.use()函数，把 Vuex 注册为 Vue 的插件
// 给Vue实例原型上添加 $store 属性
Vue.use(Vuex)

// 3. 实例化store对象并导出，该对象包含5个核心属性
export default new Vuex.Store({})
