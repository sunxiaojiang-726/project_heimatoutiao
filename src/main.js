import Vue from 'vue'
import App from './App.vue'
// 导入路由模块，拿到路由的实例对象
import router from './router'
// 导入store模块，拿到store的实例对象
import store from './store'

Vue.config.productionTip = false

new Vue({
  // 挂载路由实例对象
  router,
  // new Vue也提前留好了一个属性叫store，可以放入你创建的store对象
  // 让Vue项目拥有vuex功能
  store,
  render: (h) => h(App)
}).$mount('#app')
