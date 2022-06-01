// 生产发布环境时去掉所有console语句
import '@/utils/console.js'
import Vue from 'vue'
import App from './App.vue'
// 导入路由模块，拿到路由的实例对象
import router from './router'
// 导入store模块，拿到store的实例对象
import store from './store'
// 文章详情页代码高亮的样式
import 'highlight.js/styles/default.css'
// 导入amfe-flexible，用来设置根标签字体大小(移动端适配)
import 'amfe-flexible'
// 导入封装好的自定义指令(用于自动聚焦)
import directiveObj from './utils/directive'
// 把vant组件的注册,单独的分离成一个js文件,让main.js等清晰
import './VueComponent.js' // 直接导入并执行VueComponent.js文件

Vue.config.productionTip = false

// Vue.use()方法会执行目标对象里install方法并传入Vue类
Vue.use(directiveObj)

new Vue({
  // 挂载路由实例对象
  router,
  // new Vue也提前留好了一个属性叫store，可以放入你创建的store对象
  // 让Vue项目拥有vuex功能
  store,
  render: (h) => h(App)
}).$mount('#app')

// 目标2：组件使用套路
// 1.明确目标，找到类似组件
// 2.引入注册然后复制使用(标签和js复制)
// 3.读和删没用的
// 4.修改，改成我们想要的样子
// (1):找到类名，自己写css覆盖掉它
// (2):看文档，是否支持自定义样式

// 首页 -> 滚动位置保存
// 问题: 首页滚动一些,点击"我的"再切回来,为何滚动条回到了顶部?
// 疑惑: 组件缓存keep-alive保存组件标签+样式+js变量,不会保存滚动位置
// 原因: 切换到我的页面,页面高度不够高,没有滚动条(此滚动条是整个网页的,不是首页特有的),
//       滚动位置会回到顶部,所以切换回首页,滚动条还在顶部
// 解决: 滚动时,实时保存,在它的路由对象meta中保存滚动位置

// 下面是知识点讲解：
