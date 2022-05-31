// 统一封装接口方法
// 每个方法负责请求一个url地址
// 逻辑页面，导入这个接口方法，就能发送请求喽
// 好处：请求url路径，可以在这里统一管理
import request from '@/utils/request.js'
import { getStorage } from '@/utils/storage.js'

// 既引入也同时向外按需导出,所有引入过来的方法(中转)
export * from './ArticleDetail.js'

// 登录 - 登录接口
// axios内部，会把参数对象转成JSON字符串的格式发给后台
// axios内部，会自动携带请求参数(headers)里
// Content-Type: 'application/json'帮你添加好
export const loginAPI = ({ mobile, code }) => {
  // 把Promise实例返回给调用loginAPI这个接口方法的组件
  return request({
    url: '/v1_0/authorizations',
    method: 'POST',
    data: {
      mobile,
      code
    }
  })
}

// 用户 - 刷新token
export const getNewTokenAPI = () => {
  // 把Promise实例返回给调用loginAPI这个接口方法的组件
  return request({
    url: '/v1_0/authorizations',
    method: 'PUT',
    headers: {
      // Bearer 后边一定要有空格
      // 请求拦截器里统一携带的是token,而这次请求后端规定要携带的是refresh_token
      // 所以在axios请求拦截器里判断,就是为了这种情况准备的
      Authorization: 'Bearer ' + getStorage('refresh_token')
    }
  })
}

// 用户 - 获取个人资料(编辑页面使用)
export const userProfileAPI = () => {
  return request({
    url: '/v1_0/user/profile',
    method: 'GET'
  })
}

// 用户 - 更新头像
export const updateUserPhotoAPI = (fd) => {
  return request({
    url: '/v1_0/user/photo',
    method: 'PATCH',
    data: fd // fd 是外面一会传进来的new FormData() 表单对象

    // 如果你的请求体直接是FormDate表单对象，你也不用自己添加Content-Type：multipart/form-data
    // axios发现数据请求体是表单对象，他也不会转换为json字符串，也不会带Content-Type:application/json，
    // 而是交给浏览器，浏览器发现请求体是FormData，会自己携带Content-Type:multipart/form-data

    // Content-Type:application/json; 是axios自动携带的，前提：data请求体是对象 -> json字符串 -> 发给后台
    // Content-Type:multipart/form-data; 是浏览器自动携带的，前提：data请求体必须是FormData类型对象
  })
}

// 用户 - 更新基本资料
export const updateUserProfileAPI = (dataObj) => {
  // 1. axios中，data请求体传参，如果值为null是不会忽略这个参数的
  // 也会把参数名和值携带给后台(只有params遇到null才会忽略)
  // 2. 形参art_id可选参数，如果逻辑页面是对文章评论，则不需要传递art_id
  // 所以这时，内部art_id值为null就证明此次调用，是针对文章评论

  // 判断，有什么值，再带什么参数给后台
  // 写法1：结构赋值，4个判断，往空对象上添加，有值的加上去(跟以前一样)
  // 写法2：外面想传几对key+value，就直接把对象传入后台
  // 写法3：上面写法不够语义化，看不出obj里有什么

  const obj = {
    name: '', // 昵称
    gender: 0, // 性别，0-男，1-女
    birthday: '', // 生日，格式'2018-12-20'
    intro: '' // 个人介绍
  }
  // 使用for in 循环参数对象 dataObj 和将要传到接口的 obj 对象
  for (const prop in obj) {
    if (dataObj[prop] === undefined) {
      // 遍历参数对象里每个key
      delete obj[prop] // 从obj身上移除这对属性和值
    } else {
      obj[prop] = dataObj[prop] // 如果使用了，就从参数对象取出对应key值，保存到obj上
    }
  }

  return request({
    url: '/v1_0/user/profile',
    method: 'PATCH', // PATCH 请求方式是局部更新, PUT全都更新
    data: obj
  })
}

// 用户 - 获取基本信息(我的页面显示数据)
export const getUserInfoAPI = () => {
  return request({
    url: '/v1_0/user',
    method: 'GET'
  })
}

// 频道 - 获取所有频道接口
export const getAllChannelsAPI = () => {
  return request({
    url: '/v1_0/channels',
    method: 'GET'
  })
}

// 频道 - 获取用户选择的频道
// 注意: 用户如果没有登录,默认返回后台设置的默认频道列表
export const getUserChannelsAPI = () => {
  return request({
    url: '/v1_0/user/channels',
    method: 'GET'
  })
}

// 频道 - 更新覆盖我们的频道
export const updateChannelsAPI = ({ channels }) => {
  return request({
    url: '/v1_0/user/channels',
    method: 'PUT',
    data: {
      channels // 用户已选的整个频道数组
    }
  })
}

// 频道- 删除用户指定的频道
export const removeTheChannelAPI = ({ channelId }) => {
  return request({
    url: `/v1_0/user/channels/${channelId}`,
    method: 'DELETE'
  })
}

// 文章 - 获取文章列表
export const getAllArticleListAPI = ({ channel_id, timestamp }) => {
  return request({
    url: '/v1_0/articles',
    method: 'GET',
    // params 里的查询参数,axios会帮你拼接在URL?后面(查询字符串)
    params: {
      channel_id,
      timestamp
    }
  })
}

// 文章 - 反馈 - 不感兴趣
export const dislikeArticleAPI = ({ artId }) => {
  return request({
    url: '/v1_0/article/dislikes',
    method: 'POST',
    // post请求体
    data: {
      target: artId
    }
  })
}

// 文章 - 反馈 - 反馈垃圾内容
export const reportArticleAPI = ({ artId, type }) => {
  return request({
    url: '/v1_0/article/reports',
    method: 'POST',
    // post请求体
    data: {
      target: artId,
      type: type,
      remark:
        '如果你想写，你可以逻辑页面判断一下，如果点击的类型是0，再给一个弹出框输入框输入其它问题，传参到这里'
    }
  })
}

// 搜索 - 联想建议列表
export const suggestListAPI = ({ keywords }) => {
  return request({
    url: '/v1_0/suggestion',
    method: 'GET',
    params: {
      q: keywords
    }
  })
}

// 搜索 - 搜索结果列表
export const searchResultAPI = ({ page = 1, per_page = 10, q }) => {
  return request({
    url: '/v1_0/search',
    method: 'GET',
    params: {
      page,
      per_page,
      q
    }
  })
}
