<template>
  <div>
    <!-- Header 区域 -->
    <van-nav-bar
      fixed
      title="文章详情"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 文章详情 - 等待加载中 -->
    <!-- 文章详情在加载时(加载时,文章详情对象中的某个属性为undefined),让加载组件显示 -->
    <van-loading
      type="spinner"
      color="#1989fa"
      v-if="artObj.title === undefined"
    >
      文章疯狂加载ing...
    </van-loading>

    <div v-else>
      <!-- 文章信息区域 -->
      <div class="article-container">
        <!-- 文章标题 -->
        <h1 class="art-title">{{ artObj.title }}</h1>

        <!-- 用户信息 -->
        <van-cell
          center
          :title="artObj.aut_name"
          :label="formatDate(artObj.pubdate)"
        >
          <template #icon>
            <img :src="artObj.aut_photo" alt="" class="avatar" />
          </template>
          <template #default>
            <div>
              <van-button
                type="info"
                size="mini"
                v-if="artObj.is_followed === true"
                @click="followedFn(true)"
                >已关注</van-button
              >
              <van-button
                icon="plus"
                type="info"
                size="mini"
                plain
                v-else
                @click="followedFn(false)"
                >关注</van-button
              >
            </div>
          </template>
        </van-cell>

        <!-- 分割线 -->
        <van-divider></van-divider>

        <!-- 文章内容 -->
        <div class="art-content" v-html="artObj.content"></div>

        <!-- 分割线 -->
        <van-divider>End</van-divider>

        <!-- 点赞 -->
        <div class="like-box">
          <!-- 用户对文章的态度, -1: 无态度，0-不喜欢，1-点赞 -->
          <!-- 只有0是false,-1和1都是true -->
          <van-button
            icon="good-job"
            type="danger"
            size="small"
            v-if="artObj.attitude === 1"
            @click="loveFn(true)"
            >已点赞</van-button
          >
          <van-button
            icon="good-job-o"
            type="danger"
            plain
            size="small"
            v-else
            @click="loveFn(false)"
            >点赞</van-button
          >
        </div>
      </div>

      <!-- 评论列表+发表评论区域 -->
      <div>
        <CommentList></CommentList>
      </div>
    </div>
  </div>
</template>

<script>
import {
  datailAPI,
  userFollowAPI,
  userUnFollowAPI,
  likeArticleAPI,
  unLikeArticleAPI
} from '@/api/index.js'
import { timeAgo } from '@/utils/data.js'
import CommentList from './CommentList.vue'
export default {
  name: 'Detail',
  data() {
    return {
      artObj: {} // 文章详情对象
    }
  },
  async created() {
    const res = await datailAPI({
      artId: this.$route.query.art_id
    })
    console.log(res, '文章详情')
    // 请求回来的东西,都要放到data中,让上边使用
    this.artObj = res.data.data
  },
  methods: {
    formatDate: timeAgo,
    // 关注/取关作者
    // 注意: 每个登录的手机号,都维护着自己的关注列表
    // 强烈建议: 重新用自己的手机号,不要都用13888888888,避免冲突
    async followedFn(bool) {
      if (bool === true) {
        // 用户点在了 "已关注" 按钮上
        // 页面 -> 显示关注按钮
        this.artObj.is_followed = false
        // 业务 -> 取关
        // 调接口 -> 取关接口
        const res = await userUnFollowAPI({
          userId: this.artObj.aut_id
        })
        console.log(res, '取关作者')
      } else {
        // 用户点在了 "关注" 按钮上
        // 页面 -> 显示已关注按钮
        this.artObj.is_followed = true
        // 业务 -> 关注
        // 调接口 -> 关注接口
        const res = await userFollowAPI({
          userId: this.artObj.aut_id
        })
        console.log(res, '关注作者')
      }
    },

    // 点赞/取消点赞文章
    async loveFn(bool) {
      if (bool === true) {
        // 用户点在了 "已点赞" 按钮上
        // 页面 -> 显示"点赞"按钮
        this.artObj.attitude = 0 // 0 不喜欢,-1无态度
        // 业务 -> 取消点赞
        // 调接口 -> 取消点赞文章接口
        const res = await unLikeArticleAPI({
          artId: this.artObj.art_id
        })
        console.log(res, '取消文章点赞')
      } else {
        // 用户点在了 "点赞" 按钮上
        // 页面 -> 显示"已点赞"按钮
        this.artObj.attitude = 1
        // 业务 -> 点赞
        // 调接口 -> 点赞文章接口
        const res = await likeArticleAPI({
          artId: this.artObj.art_id
        })
        console.log(res, '文章点赞')
      }
    }
  },
  components: {
    CommentList
  }
}
</script>

<style scoped lang="less">
// 文章信息区域样式
.article-container {
  padding: 10px;
  margin-top: 46px;
}
.art-title {
  font-size: 16px;
  font-weight: bold;
  margin: 10px 0;
}

.art-content {
  font-size: 12px;
  line-height: 24px;
  width: 100%;
  overflow-x: scroll;
  word-break: break-all;
  /deep/ img {
    width: 100%;
  }
  /deep/ pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

.van-cell {
  padding: 5px 0;
  &::after {
    display: none;
  }
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f8f8f8;
  margin-right: 5px;
  border: none;
}

.like-box {
  display: flex;
  justify-content: center;
}

// 加载中居中样式
.van-loading {
  text-align: center;
  margin-top: 50px;
}
</style>
