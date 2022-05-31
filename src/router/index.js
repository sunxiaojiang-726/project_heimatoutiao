// 1. 导入 Vue 和 VueRouter 的包
import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from '@/views/Login/index.vue'
// import Layout from '@/views/Layout/index.vue'
// import Home from '@/views/Home/index.vue'
// import User from '@/views/User/index.vue'
// import Search from '@/views/Serach/index.vue'
// import SearchResult from '@/views/Serach/SearchResult.vue'
// import ArticleDetail from '@/views/ArticleDetail/index.vue'
// import UserEdit from '@/views/User/UserEdit.vue'
// import Chat from '@/views/Chat/index.vue'
import { getToken } from '@/utils/token.js'
// 2. 调用Vue.use()函数，把 VueRouter 安装为 Vue 的插件
// 让Vue项目可以用router-link 和 router-view 两个标签
Vue.use(VueRouter)

// 总结：
// 路由懒加载：为了让首页渲染更快一点
// 思路：把我的组件对应的js分成若干个.js，路由切换到哪个页面，才去加载对应的.js文件
// 原因：webpack分析入口时，发现router里上来就import所有页面，所以直接打包进app.js -> 导致很大
// 解决方案：当路由规则匹配时，才现去import引入对应的组件js文件

// 设置路由规则
const routes = [
  // 默认进入的路径是/，因为是新闻网页，默认重定向到/layout/home这个路由下(首页)
  {
    path: '/',
    redirect: '/layout/home'
  },
  // 定义 登录 的路由规则(一级)
  {
    path: '/login',
    component: () =>
      import(/* webpackChunkName: "Login" */ '@/views/Login/index.vue'),
    // 需求:如果你已经登录了,不要切换到登录页面
    // 路由的独享守卫
    beforeEnter: (to, from, next) => {
      if (getToken()?.length > 0 && to.path === '/login') {
        // next(false) // 留在原地
        // 用户想要进登录页,不留在原地了,而是返回首页
        next('/layout/home')
      } else {
        next() // 其它情况,通通放行----放行必须写!!!因为这是全局前置守卫
      }
    }
  },
  // 定义 layout 的路由规则(一级)
  {
    path: '/layout',
    component: () =>
      import(/* webpackChunkName: "Layout" */ '@/views/Layout/index.vue'),
    // layout的子路由规则
    children: [
      // 定义 home 的路由规则(二级)
      // 访问/layout/home时，展示 Home 组件
      {
        path: 'home',
        component: () =>
          import(/* webpackChunkName: "Home" */ '@/views/Home/index.vue'),
        meta: {
          scrollT: 0 // 保存首页离开时,滚动条位置
        }
      },
      // 定义 user 的路由规则(二级)
      // 访问/layout/user时，展示 user 组件
      {
        path: 'user',
        component: () =>
          import(/* webpackChunkName: "User" */ '@/views/User/index.vue')
      }
    ]
  },
  // 定义 搜索 的路由规则(一级)
  {
    path: '/search',
    component: () =>
      import(/* webpackChunkName: "Search" */ '@/views/Serach/index.vue')
  },
  // 定义 搜索结果页 的路由规则(一级)
  {
    path: '/search_result/:kw',
    component: () =>
      import(
        /* webpackChunkName: "SearchResult" */ '@/views/Serach/SearchResult.vue'
      )
  },
  // 定义 文章详情页 的路由规则(一级)
  {
    path: '/detail',
    component: () =>
      import(
        /* webpackChunkName: "ArticleDetail" */ '@/views/ArticleDetail/index.vue'
      )
  },
  // 定义 编辑用户信息页面 的路由规则(一级)
  {
    path: '/user_editor',
    component: () =>
      import(/* webpackChunkName: "UserEdit" */ '@/views/User/UserEdit.vue')
  },
  // 定义 聊天页面 的路由规则(一级)
  {
    path: '/chat',
    component: () =>
      import(/* webpackChunkName: "Chat" */ '@/views/Chat/index.vue')
  }
]

// 3. 创建路由的实例对象
const router = new VueRouter({
  // 引入路由规则
  routes
})

// 路由的全局前置守卫
// 每次发生路由跳转之前，会执行此函数，此函数可以决定路由是否跳转/取消/强制切换到别的路由
// router.beforeEach((to, from, next) => {
//   // 需求:如果你已经登录了,不要切换到登录页面

//   // ?. 叫做可选链操作符，如果前边对象里没有length属性，则该表达式(getToken()?.length > 0)短路,原地返回一个undefined
//   // 如果getToken()在原地有值(token字符串)，才能调用length获取长度
//   if (getToken()?.length > 0 && to.path === '/login') {
//    // next(false) // 留在原地
//    用户想要进登录页,不留在原地了,而是返回首页
//    next('/layout/home')
//   } else {
//     next() // 其它情况,通通放行----放行必须写!!!因为这是全局前置守卫
//   }
// })

// 4. 向外共享路由的实例对象
export default router
