import request from '@/utils/request.js'

// 文章 - 获取文章详情
export const datailAPI = ({ artId }) => {
  return request({
    url: `/v1_0/articles/${artId}`,
    method: 'GET'
  })
}

// 文章 - 点赞
export const likeArticleAPI = ({ artId }) => {
  return request({
    url: '/v1_0/article/likings',
    method: 'POST',
    data: {
      target: artId
    }
  })
}

// 文章 - 取消点赞
export const unLikeArticleAPI = ({ artId }) => {
  return request({
    url: `/v1_0/article/likings/${artId}`,
    method: 'DELETE'
  })
}

// 文章 - 评论列表
export const commentsListAPI = ({ id, offset = null, limit = 10 }) => {
  return request({
    url: '/v1_0/comments',
    method: 'GET',
    params: {
      // axios只针对params参数,如果发现键值对,值为null,会忽略此参数名和值不携带在url?后面
      type: 'a', // 什么时候需要外边传: 此值会变化
      source: id,
      offset,
      limit
    }
  })
}

// 文章 - 评论 - 点赞
export const likeCommentAPI = ({ comId }) => {
  return request({
    url: '/v1_0/comment/likings',
    method: 'POST',
    data: {
      target: comId
    }
  })
}

// 文章 - 评论 - 取消点赞
export const unlikeCommentAPI = ({ comId }) => {
  return request({
    url: `/v1_0/comment/likings/${comId}`,
    method: 'DELETE'
  })
}

// 文章 - 评论 - 发布评论
export const commentSendAPI = ({ id, content, art_id = null }) => {
  // 1. axios中，data请求体传参，如果值为null是不会忽略这个参数的
  // 也会把参数名和值携带给后台(只有params遇到null才会忽略)
  // 2. 形参art_id可选参数，如果逻辑页面是对文章评论，则不需要传递art_id
  // 所以这时，内部art_id值为null就证明此次调用，是针对文章评论

  // data请求体对象需要自己处理
  const obj = {
    target: id,
    content
  }
  if (art_id !== null) {
    // 如果本次有第三个参数，证明是对评论进行回复
    obj.art_id = art_id
  }
  return request({
    url: '/v1_0/comments',
    method: 'POST',
    data: obj
  })
}

// 用户 - 关注
export const userFollowAPI = ({ userId }) => {
  return request({
    url: '/v1_0/user/followings',
    method: 'POST',
    data: {
      target: userId
    }
  })
}

// 用户 - 取消关注
export const userUnFollowAPI = ({ userId }) => {
  return request({
    url: `/v1_0/user/followings/${userId}`,
    method: 'DELETE'
  })
}
