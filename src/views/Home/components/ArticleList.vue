<template>
  <div>
    <!-- 下拉刷新组件 -->
    <van-pull-refresh v-model="isLoading" @refresh="onRefresh">
      <!-- 上拉加载更多组件 -->
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        :immediate-check="false"
        offset="50"
        @load="onLoad"
      >
        <ArticleItem
          v-for="obj in list"
          :key="obj.art_id"
          :artObj="obj"
          @disLikeEV="dislikeFn"
          @reportEV="reportFn"
          @click.native="itemClickFn(obj.art_id)"
        ></ArticleItem>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import ArticleItem from '../../../components/ArticleItem.vue'
import {
  getAllArticleListAPI,
  dislikeArticleAPI,
  reportArticleAPI
} from '@/api/index.js'
import Notify from '@/ui/Notify.js'
// 问题1: 网页刚打开,created请求和onLoad里请求同时发送,而且请求的都是最新的数据
// 而在onLoad 中,2次一样的数据合并,数据重复,造成key重复了
// 原因:van-list组件,组件挂载时,默认就会判定一次是否触底
// 第一页数据也是网络请求回来的,标签先挂载了,但数据回来才是更新DOM,所以此时标签没有高度,list的load事件上来就触发了
// 解决1:刚开始不让他判断是否触底,把immediate-check属性设置为false(不在初始化时立即执行滚动位置检查)
// 解决2:onLoad第一行,写数组长度的判断(如果刚开始长度为0,那么不执行onLoad事件)
export default {
  props: {
    // 文章列表数组
    // list: {
    //   type: Array
    // }
    channelId: Number // 频道ID
  },
  data() {
    return {
      list: [], // 文章列表
      loading: false, // 底部加载状态
      finished: false, // 是否全部加载完成
      theTime: new Date().getTime(), // 用于分页
      isLoading: false // 顶部加载状态
    }
  },
  components: {
    ArticleItem
  },
  created() {
    this.getArticleListFn()
  },
  methods: {
    // 专门负责发送请求的
    async getArticleListFn() {
      // pre_timestamp 下一段开头的那篇文章的时间戳
      // 第一次 系统时间(timestamp) -> 后台返回了0-9条数据 -> 携带第10条的pre_timestamp 值返回
      // 第二次 (timestamp) - 上一次pre_timestamp (代表告诉后台,从指定的时间戳再往后找十个) 10-19
      // this.artlist = [旧数据在前，新数据在后]
      const res = await getAllArticleListAPI({
        channel_id: this.channelId, // 先默认请求 推荐 频道数据
        timestamp: this.theTime
      })
      console.log(res, '请求文章')
      this.list = [...this.list, ...res.data.data.results]
      this.theTime = res.data.data.pre_timestamp // 保存下一页的页码

      this.loading = false // 如果不关闭,底部一直是加载状态,下次触底不会再触发onLoad

      // 如果没有更多数据了(没有下一页了,但是本页的数据还要显示，所以判断在后),后台返回的时间戳将会变成null
      if (res.data.data.pre_timestamp === null) {
        this.finished = true
      }

      // 顶部加载状态改为false
      this.isLoading = false
    },
    // 底部加载 事件方法
    async onLoad() {
      // immediate-check: 内部不要进行判断而已，监听滚动事件的代码还存在
      // 第一个频道滚动到底部，再切换第二个频道的时候(新建-内容没有那么高)，滚动会从底部滚回到顶部
      // 这个时候发生了滚动，所以滚动事件还是触发了，immediate-check判断无效
      if (this.list.length === 0) {
        // 如果不加immediate-check,上来走一次onloading,loading状态自动就为true
        // 等created数据回来撑开高度，滚动到底部时,loading为true就不会重新执行onload方法了,所以要改回来
        this.loading = false
        return // 如果页面没有数据，没有高度，让本次onload逻辑代码不往下执行
      }
      // 触底时 获取新数据
      this.getArticleListFn()
    },
    // 顶部刷新 事件方法
    async onRefresh() {
      // 目标:list数组清空,来一份新的数据
      this.list = []
      this.theTime = new Date().getTime()
      this.getArticleListFn()
    },
    // 反馈-不感兴趣
    async dislikeFn(id) {
      // 如果用try...catch自己处理错误，内部throw就不会向控制台抛出打印错误，而是交给你的catch内来自定义错误处理
      // try...catch捕获同步代码的异常
      // await就是等着异步请求的结果
      await dislikeArticleAPI({ artId: id })
      // res 里没有什么有用的信息，所以 await 往下放行， 就证明请求和响应是成功的，在UI界面给出"反馈成功"提示
      Notify({ type: 'success', message: '反馈成功！' })
    },
    // 反馈-垃圾内容
    async reportFn(id, value) {
      await reportArticleAPI({
        artId: id,
        type: value
      })
      Notify({ type: 'success', message: '举报成功！' })
    },
    // 文章单元格 - 点击事件
    itemClickFn(id) {
      this.$router.push({ path: `/detail?art_id=${id}` })
    }
  }
}
</script>

<style></style>
