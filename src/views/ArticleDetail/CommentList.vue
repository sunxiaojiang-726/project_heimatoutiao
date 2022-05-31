<template>
  <div>
    <!-- 评论列表 -->
    <!-- :class 动态class语法格式 -->
    <div
      class="cmt-list"
      :class="{
        'art-cmt-container-1': isShowCmtBox,
        'art-cmt-container-2': !isShowCmtBox
      }"
    >
      <!-- Vant组件 - List列表 - 实现上拉加载更多
      1. van-list最好在现在这个位置，让底部文字/加载中，作为div的内容，"cmt-list"容器padding-bottom让底部文字也挤上去了-看得见
      2. vant-list包裹列表，组件内源码，检测网页滚动事件，判断滚动位置是否到达内容高度(触底) -> 触发load事件执行
         内部自动把loading: 改为true -> 底部加载中文字出现 -> 内部认为现在处于加载中状态
      3. :immediate-check="false" 作用：让list组件不要上来就检查是否触底
         原因：list中列表内容是异步网络请求回来的；van-list组件挂载的时候，没有高度，list就会触底，执行一次onload方法。
         问题：created发一次，onload立刻又发送一次，请求2次第一页的数据
      -->
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多评论了，请发表评论"
        offset="50"
        @load="onLoad"
        :immediate-check="false"
      >
        <!-- 评论的 Item 项 -->
        <div class="cmt-item" v-for="obj in commentsArr" :key="obj.com_id">
          <!-- 头部区域 -->
          <div class="cmt-header">
            <!-- 头部左侧 -->
            <div class="cmt-header-left">
              <img :src="obj.aut_photo" alt="" class="avatar" />
              <span class="uname">{{ obj.aut_name }}</span>
            </div>
            <!-- 头部右侧 -->
            <div class="cmt-header-right">
              <van-icon
                name="like"
                size="16"
                color="red"
                v-if="obj.is_liking === true"
                @click="likeFn(true, obj)"
              />
              <van-icon
                name="like-o"
                size="16"
                color="gray"
                v-else
                @click="likeFn(false, obj)"
              />
            </div>
          </div>
          <!-- 主体区域 -->
          <div class="cmt-body">
            {{ obj.content }}
          </div>
          <!-- 尾部区域 -->
          <div class="cmt-footer">{{ formatDate(obj.pubdate) }}</div>
        </div>
      </van-list>
    </div>

    <!-- 发表评论的容器 -->
    <div>
      <!-- 底部添加评论区域 - 1 -->
      <div class="add-cmt-box van-hairline--top" v-if="isShowCmtBox === true">
        <van-icon name="arrow-left" size="0.48rem" @click="$router.back()" />
        <div class="ipt-cmt-div" @click="toggleShowFn">发表评论</div>
        <div class="icon-box">
          <van-badge :content="totalCount === 0 ? '' : totalCount" max="50">
            <van-icon
              name="comment-o"
              size="0.53333334rem"
              @click="commentClickFn"
            />
          </van-badge>
          <van-icon name="star-o" size="0.53333334rem" />
          <van-icon name="share-o" size="0.53333334rem" />
        </div>
      </div>

      <!-- 底部添加评论区域 - 2 -->
      <div class="cmt-box van-hairline--top" v-else>
        <textarea
          placeholder="友善评论、理性发言、阳光心灵"
          v-fofo
          @blur="blurFn"
          v-model.trim="comText"
        ></textarea>
        <van-button
          type="default"
          :disabled="comText.length === 0"
          @click="sendFn"
          >发布</van-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import {
  commentsListAPI,
  unlikeCommentAPI,
  likeCommentAPI,
  commentSendAPI
} from '@/api/index.js'
import { timeAgo } from '@/utils/data.js'
export default {
  data() {
    return {
      offset: null, // 偏移量 评论ID
      commentsArr: [], // 评论列表
      isShowCmtBox: true, // 底部显示矮/高的评论容器
      totalCount: 0, // 本篇文章的评论数量
      comText: '', // 发布评论的内容
      loading: false, // 底部加载按钮
      finished: false, // 是否有更多
      lastId: null // 分页
    }
  },
  async created() {
    const res = await commentsListAPI({
      // 注意:路由上有挂载art_id,可以不用父向子传值,直接从路由上拿
      id: this.$route.query.art_id // 文章id
    })
    console.log(res, '评论列表')
    // 保存到变量中
    this.commentsArr = res.data.data.results // 评论列表
    this.totalCount = res.data.data.total_count // 评论总数量
    this.lastId = res.data.data.last_id // 用来做分页,是本次返回结果的最后一个评论的id，作为请求下一页数据的offset参数

    // 细节优化：如果网页打开，没有评论，res结果是一个空数组
    if (res.data.data.results.length === 0) {
      this.finished = true
    }
  },
  methods: {
    formatDate: timeAgo,
    // 评论小心心,点赞/取消点赞
    async likeFn(bool, comObj) {
      if (bool === true) {
        // 点击了 "红心"
        // 页面 - 显示 "白心"
        comObj.is_liking = false
        // 请求接口 - 取消评论点赞
        const res = await unlikeCommentAPI({
          comId: comObj.com_id
        })
        console.log(res, '取消评论点赞')
      } else {
        // 点击了 "白心"
        // 页面 - 显示 "红心"
        comObj.is_liking = true
        // 请求接口 - 对评论点赞
        const res = await likeCommentAPI({
          comId: comObj.com_id
        })
        console.log(res, '评论点赞')
      }
    },
    // 点击矮框 -> 显示评论输入框(第2套-高)
    toggleShowFn() {
      this.isShowCmtBox = false
    },
    // 点击评论按钮 -> 把第一条评论滑动到最上面
    commentClickFn() {
      // 看扩展ppt,只要设置window.scrollTo(0,文章内容高度)
      // JS 代码是在html+css运行后,真实DOM已经在网页上了,从document里往下获取标签是ok的
      // 文章内容高度为:该div.scrollHeight属性
      // const articleHeight = document.querySelector('.article-container').scrollHeight
      // console.log(articleHeight)
      // window.scrollTo() 使网页进行滚动,设置相应的坐标,就可以让网页滚动到屏幕的最顶端
      // 如果底下没有内容了,则不再滚动
      // window.scrollTo(0, articleHeight)

      // ·css可以做动画：例如轮播图，CSS3位移，旋转，动画（你必须修改css属性才能触发css动画)
      // 使用：animation(配合帧动画)，transition(过渡动画)
      // ·js也可以做动画噢：例如滚动条滚动…
      // 使用：计时器间隔时间，修改目标状态，（动画片一样）
      // 动画实现的原生代码,在配套资料扩展->txt文档里

      //   方一：死板
      //  let scrollHeight =  document.querySelector(".article-container").scrollHeight
      //  scrollTo(0,scrollHeight)

      // 方二：不丝滑
      // const now = window.scrollY  //当前评论已经滚动距离
      // const dist = document.querySelector(".article-container").scrollHeight   //需要滚动的距离
      // const step = dist/10 //速度
      // setTimeout(() => {
      //     if(dist < now+step){
      //         return
      //     }
      //     scrollTo(0,now+step)
      //     this.moveFn()
      // }, 300);

      // 方三：缓冲动画
      // const now = window.scrollY  //当前评论已经滚动距离
      // const dist = document.querySelector(".article-container").scrollHeight   //需要滚动的距离
      // const step = (dist-now)/8 //速度
      // setTimeout(() => {
      //     if(step < 1){
      //         scrollTo(0,dist)
      //         return
      //     }
      //     scrollTo(0,now+step)
      //     this.moveFn()
      // }, 10);

      // 比较方便的一个方法(即能滚动,也能带动画)
      // 原生标签.scrollIntoView()方法, 让原生的标签滚动到屏幕最上边  HTML5新增的
      // 为何选择like-box(点赞那个div),不选择第一条评论, 因为头部导航会挡住
      // 注意:有的人的电脑不支持这个方法,没有滑动效果 -> 只能用原生JS写(兼容性好)
      document.querySelector('.like-box').scrollIntoView({
        behavior: 'smooth'
      })
    },
    // 发布按钮的点击事件
    async sendFn() {
      // 前端效果： 把评论加入到列表里
      const res = await commentSendAPI({
        // 注意:路由上有挂载art_id,可以不用父向子传值,直接从路由上拿
        id: this.$route.query.art_id, // 文章id
        content: this.comText // 发布评论的内容
      })
      console.log(new Date())
      console.log(res, '发布评论')
      // 因为返回的评论对象和调用评论列表返回的对象一样，所以直接增加到数组头部(不用再请求评论列表，性能更高)
      this.commentsArr.unshift(res.data.data.new_obj)
      // 细节优化：发送评论后让评论数量+1,同时让输入框内容置空
      this.totalCount++
      this.comText = ''
      // 让刚发布的评论滚动到视线中
      this.commentClickFn()
    },
    // 输入框失去焦点
    blurFn() {
      // 问题: 点击发布按钮发现点击事件不执行 - 排除代码问题
      // 原因: 高的评论容器-页面点击发布的一瞬间，输入框失去焦点，被v-if和v-else移除了整个标签
      //       导致点击事件没来的及执行
      // 解决：失去焦点时，变量值在最后再执行(延时高的评论容器的销毁)
      setTimeout(() => {
        this.isShowCmtBox = true
      }, 0)
    },
    // 底部加载更多
    async onLoad() {
      // 判断和immediate-check可选任意一个
      if (this.commentsArr.length > 0) {
        // 请求下一页数据
        const res = await commentsListAPI({
          id: this.$route.query.art_id, // 文章id
          offset: this.lastId
        })
        console.log(res, '评论列表')
        // 保存到变量中
        this.commentsArr = [...this.commentsArr, ...res.data.data.results] // 新的评论列表
        this.totalCount = res.data.data.total_count // 评论总数量
        this.lastId = res.data.data.last_id // 第二次还要把last_id存起来，作为下一次请求数据的offset偏移量

        if (res.data.data.last_id === null) {
          // 如果没有下一页数据了
          this.finished = true // 数据全部加载完毕设置
        }

        this.loading = false // 加载状态结束
      } else {
        // 4. 如果不加immediate-check,上来走一次onloading,loading状态自动就为true，但是if又进不去
        // 等created数据回来撑开高度，滚动到底部时,loading为true就不会重新执行onload方法了
        // 解决：if进不去，就进去else里把状态关闭掉
        this.loading = false
      }
    }
  }
}

// 分享功能思路
// 如果想要分享到朋友圈/微信好友 -> 微信平台 -> 去对应平台的开发者平台上申请权限，注册公司资质
// 分享到微博 -> 微博开发平台 -> 注册账号，调用人家平台封装的js代码(SDK)，调用它们的接口来实现分享功能
</script>

<style scoped lang="less">
.cmt-list {
  padding: 10px;
  .cmt-item {
    padding: 15px 0;
    + .cmt-item {
      border-top: 1px solid #f8f8f8;
    }
    .cmt-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .cmt-header-left {
        display: flex;
        align-items: center;
        .avatar {
          width: 40px;
          height: 40px;
          background-color: #f8f8f8;
          border-radius: 50%;
          margin-right: 15px;
        }
        .uname {
          font-size: 12px;
        }
      }
    }
    .cmt-body {
      font-size: 14px;
      line-height: 28px;
      text-indent: 2em;
      margin-top: 6px;
      word-break: break-all;
    }
    .cmt-footer {
      font-size: 12px;
      color: gray;
      margin-top: 10px;
    }
  }
}
/*美化 - 文章详情 - 底部的评论页面 */
// 外层容器
.art-cmt-container-1 {
  padding-bottom: 46px;
}
.art-cmt-container-2 {
  padding-bottom: 80px;
}

// 发布评论的盒子 - 1
.add-cmt-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  box-sizing: border-box;
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 46px;
  line-height: 46px;
  padding-left: 10px;
  .ipt-cmt-div {
    flex: 1;
    border: 1px solid #efefef;
    border-radius: 15px;
    height: 30px;
    font-size: 12px;
    line-height: 30px;
    padding-left: 15px;
    margin-left: 10px;
    background-color: #f8f8f8;
  }
  .icon-box {
    width: 40%;
    display: flex;
    justify-content: space-evenly;
    line-height: 0;
  }
}

.child {
  width: 20px;
  height: 20px;
  background: #f2f3f5;
}

// 发布评论的盒子 - 2
.cmt-box {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  padding-left: 10px;
  box-sizing: border-box;
  background-color: white;
  textarea {
    flex: 1;
    height: 66%;
    border: 1px solid #efefef;
    background-color: #f8f8f8;
    resize: none;
    border-radius: 6px;
    padding: 5px;
  }
  .van-button {
    height: 100%;
    border: none;
  }
}
</style>
