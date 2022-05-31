// 1. 导入 Vue 和 Vuex 的包
import Vue from 'vue'
import Vuex from 'vuex'

// 2. 调用Vue.use()函数，把 Vuex 注册为 Vue 的插件
// 给Vue实例原型上添加 $store 属性
Vue.use(Vuex)

// 3. 实例化store对象并导出，该对象包含5个核心属性
export default new Vuex.Store({
  state: {
    userPhoto:
      'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Finews.gtimg.com%2Fnewsapp_bt%2F0%2F13517061862%2F1000.jpg&refer=http%3A%2F%2Finews.gtimg.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1656395736&t=28892ed6028f149c16b7c77f1140895d', // 头像地址，给个默认值
    userName: '18339197800' // 名称
  },
  // mutations 是唯一可以修改state里变量值的地方
  mutations: {
    // mutations中的方法最好大写(容易区分)
    SET_USERPHOTO(state, value) {
      state.userPhoto = value
    },
    //
    SET_USERNAME(state, value) {
      state.userName = value
    }
  },
  actions: {},
  getters: {},
  modules: {}
})
