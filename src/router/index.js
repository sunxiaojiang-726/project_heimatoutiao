// 1. 导入 Vue 和 VueRouter 的包
import Vue from 'vue'
import VueRouter from 'vue-router'

// 2. 调用Vue.use()函数，把 VueRouter 安装为 Vue 的插件
// 让Vue项目可以用router-link 和 router-view 两个标签
Vue.use(VueRouter)

// 设置路由规则
const routes = []

// 3. 创建路由的实例对象
const router = new VueRouter({
  // 引入路由规则
  routes
})

// 4. 向外共享路由的实例对象
export default router
