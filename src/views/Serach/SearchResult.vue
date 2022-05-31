<template>
  <div>
    <!-- 搜索结果页-头部导航 -->
    <div class="search-result-container">
      <!-- 点击实现后退效果 -->
      <van-nav-bar
        title="搜索结果"
        left-arrow
        @click-left="$router.go(-1)"
        fixed
      />
    </div>

    <!-- 搜索结果 -->
    <div>
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多搜索结果了"
        :immediate-check="false"
        offset="50"
        @load="onLoad"
      >
        <!-- 自己封装的组件和引入的vant组件上的@click是我们自己写的自定义事件(只是叫click)
         事件修饰符.native -> 给组件内的根标签，绑定原生click点击事件
         -->
        <ArticleItem
          v-for="obj in articleLsit"
          :key="obj.art_id"
          :artObj="obj"
          :isShow="false"
          @click.native="itemClickFn(obj.art_id)"
        ></ArticleItem>
      </van-list>
    </div>
  </div>
</template>

<script>
// 问题1: 网页刚打开,created请求和onLoad里请求同时发送,而且请求的都是最新的数据
// 而2次一样的数据合并,数据重复,造成key重复了
// 原因:van-list组件,组件挂载时,默认就会判定一次是否触底,发现触底就去调用load事件
// 第一页数据也是网络请求回来的,标签先挂载了,但数据回来才是更新DOM,所以此时标签没有高度,list的load事件上来就触发了
// 解决1:刚开始不让他判断是否触底,把:immediate-check属性设置为false(不在初始化时立即执行滚动位置检查)
// 解决2:onLoad第一行,写数组长度的判断(如果刚开始长度为0,那么不执行onLoad事件)
import { searchResultAPI } from '@/api/index.js'
import ArticleItem from '@/components/ArticleItem.vue'
export default {
  name: 'SearchResult',
  data() {
    return {
      page: 1, // 页码
      articleLsit: [], // 文章列表
      loading: false, // 底部加载状态
      finished: false // 是否全部加载完成
    }
  },
  // 发起ajax请求的地方
  async created() {
    const res = await searchResultAPI({
      page: this.page,
      q: this.$route.params.kw
    })
    console.log(res, '搜索结果')
    this.articleLsit = res.data.data.results
  },
  components: {
    ArticleItem
  },
  methods: {
    // 底部加载 事件方法
    async onLoad() {
      this.page++
      const res = await searchResultAPI({
        page: this.page,
        q: this.$route.params.kw
      })

      if (res.data.data.results.length === 0) {
        // 没有更多数据
        this.finished = true
      }

      console.log(res, '搜索结果')
      this.articleLsit = [...this.articleLsit, ...res.data.data.results]

      this.loading = false
    },
    // 跳转到详情
    itemClickFn(id) {
      this.$router.push({ path: `/detail?art_id=${id}` })
    }
  }
}

// 业务：
// 前端(自己人) -> 后端(自己人)
// 后端只是保存文章的数据，文章里的图片来自于其它服务器路径(图片是第三方的)
// 后端只是保存了图片的地址
// 后端会把数据和图片地址返回给前端，前端铺设页面，用img标签 -> 获取第三方图片(此时可能出现404、403)
// 404 前端无法解决 -> 让后台换图(第三方把图片删除或搬家了) -> 前端只能给个占位图提示

// 403 你无权利去请求此地址 -> 后端做了图片防盗链
// 防止你用img标签请求此图片，它不想让它的图片，被你的网站所引用
// 后端会判断请求时，Reffer字段的来源是不是自己的地址
// 解决：在index.html： <meta name="referrer" content="no-referrer">
</script>

<style lang="less" scoped>
.search-result-container {
  padding-top: 46px;
}
</style>
