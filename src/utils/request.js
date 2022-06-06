// 基于axios封装网络请求
// 解决问题：不用在需要发起请求的组件中，每次都导入axios
import theAxios from 'axios'
import router from '@/router/index.js'
// import { Notify } from 'vant'
import { getToken, removeToken } from '@/utils/token.js' //, setToken
// import { getNewTokenAPI } from '@/api/index.js'

const axios = theAxios.create({
  // 指定请求的根路径
  baseURL: 'http://geek.itheima.net',
  // 20秒超时时间（请求20秒无响应直接判定超时）
  timeout: 20000
})

// 添加请求拦截器
axios.interceptors.request.use(
  (config) => {
    // config里是本次请求接口相关的 请求url、请求headers、请求方式等等设置
    // 在线发送请求之前做些什么
    // 目标：统一携带token，不再在各个请求接口上，设置headers
    // 判断本地有token再携带，判断具体api/index.js里如果没有携带Authorization，我再添加上去
    // ?. 叫做可选链操作符，如果前边对象里没有length属性，则短路,原地返回一个undefined
    // 如果getToken()在原地有值(token字符串)，才能调用length获取长度
    if (getToken()?.length > 0 && config.headers.Authorization === undefined) {
      config.headers.Authorization = `Bearer ${getToken()}`
      // console.log(config)
    }
    return config
  },
  (error) => {
    // 对错误请求做些什么
    return Promise.reject(error)
  }
)

// 添加响应拦截器
// 拦截器本质上就是一个函数
axios.interceptors.response.use(
  (response) => {
    // http响应状态码为2xx,3xx就进入第一个处理函数
    // 对响应数据做点什么
    return response
  },

  async (error) => {
    // http响应状态码为4xx,5xx报错就进入第二个处理函数
    // 对响应错误做点什么
    console.dir(error)
    // 只有401才代表身份过期(token过期)，才需要跳转登录
    if (error.response.status === 401) {
      // 方式1:清除token,强制跳转登录页,用户有感知
      // 需要重新点击反馈按钮,再次反馈 -> 感觉特别不好
      // Notify({ type: 'warning', message: '登录过期！' })
      removeToken() // 必须先清除token,才能让路由守卫判断失效,放行我去登录页面
      // router.currentRoute 相当于 在vue文件内 this.$route -> 当前路由信息对象
      // fullpath, 路由对象里完整路由路径#后面的一切
      router.replace(`/login?path=${router.currentRoute.fullPath}`)
      // 不能使用 this.$router(因为this不是vue组件的对象，无法调用$router)
      // 解决方案：this.$router 就是为了拿到router路由对象，所以直接去上面引入@/router下的router对象
    }

    // // 方式2:使用登录时保存的refresh_token,调用另外一个接口,
    // // 换回新的token替换到本地,再次完成本地未完成的请求,用户无感知(体验比较好)
    // const res = await getNewTokenAPI()
    // console.log(res, '获取新的token')
    // // 新的token回来之后,我们要做什么?
    // // 1. 更新token到本地
    // setToken(res.data.data.token)
    // // 2. 更新新的token在请求头里
    // error.config.headers.Authorization = `Bearer ${res.data.data.token}` // Bearer 后边必须有空格
    // // 3. 未完成的这次请求,再次发起
    // // error.config 就是上一次请求的配置对象
    // // 结果我们要return回原本逻辑页面调用的地方 - 还是return回去一个Promise实例对象
    // return axios(error.config)
    // } else if (
    //   error.response.status === 500 &&
    //   error.config.url === '/v1_0/authorizations' &&
    //   error.config.method === 'put'
    // ) {
    //   // 刷新的refresh_token也过期了
    //   localStorage.clear() // 清除localStorage里所有的值
    //   Notify({ type: 'warning', message: '登录过期了!!!' })
    //   router.replace('/login')
    // }

    return Promise.reject(error)
  }
)

export default axios
