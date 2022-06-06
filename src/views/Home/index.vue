<template>
  <div>
    <!-- 头部导航 -->
    <!-- 通过插槽自定义导航栏两侧的内容 -->
    <!-- fixed 固定定位头部导航栏 -->
    <div>
      <van-nav-bar fixed>
        <template v-slot:left>
          <!-- <img class="logo" src="@/assets/toutiao_logo.png" alt="" /> -->
          <img class="logo" src="@/assets/cug2.jpg" alt="" />
        </template>
        <template #right>
          <!-- 我们的postcss只能翻译style里的css样式
          代码，而我们标签内的行内样式无法转换px转rem，
          所以需要自己手动计算 18/37.5=0.48rem 因为 1rem=375/10=37.5px -->
          <van-icon
            name="search"
            size="0.48rem"
            color="green"
            @click="moveSearchPageFn"
          />
        </template>
      </van-nav-bar>
    </div>

    <!-- Tab栏导航 -->
    <!--
      van-tabs 一行容器
      van-tab 每个tab栏
      v-model 关联的激活项的下标(双向绑定)
     -->
    <div class="main">
      <!-- sticky粘性定位  -->
      <van-tabs
        v-model="channelId"
        @change="channelChangeFn"
        animated
        sticky
        offset-top="1.226667rem"
      >
        <!-- 循环 导航标签<van-tab>,  key用来优化DOM更新时的性能 -->
        <van-tab
          :title="obj.name"
          v-for="obj in userChannelList"
          :key="obj.id"
          :name="obj.id"
        >
          <ArticleList :channelId="channelId"></ArticleList>
        </van-tab>
      </van-tabs>

      <!-- 编辑频道的+号图标 -->
      <van-icon
        name="plus"
        size="0.37333334rem"
        class="moreChannels"
        @click="plusClickFn"
      />
    </div>

    <!-- 频道管理的弹出层 -->
    <!-- 把弹出层也挂载到body上，让他罩住整个页面，给其设置自己的类名来单独改样式，防止影响到反馈面板那个弹出层 -->
    <van-popup class="channel_popup" v-model="show" get-container="body">
      <ChannelEdit
        :userList="userChannelList"
        :unCheckList="unCheckChannelList"
        @addChannelEV="addChannelFn"
        @removeChannelEV="removeChannelFn"
        @closeEV="closeFn"
        ref="editRef"
        v-model="channelId"
      ></ChannelEdit>
    </van-popup>
  </div>
</template>

<script>
import {
  getUserChannelsAPI,
  getAllChannelsAPI,
  updateChannelsAPI,
  removeTheChannelAPI
} from '@/api/index.js'
import ArticleList from './components/ArticleList.vue'
import ChannelEdit from './ChannelEdit.vue'
// 目标1:获取不同的文章列表,需要传递不同的频道ID
// 想法:让van-tabs的v-model 关联我们的频道ID,而不是关联索引,通过给van-tab添加name属性实现
// v-model默认关联索引,按索引查询文章的话,那就不是那个类别的文章了!!

// 目标2:点击tab标签页,@change触发,都是重新发起请求拿到新的数据
// 问题:每次切换tab拿到的数据都是新的,即使你用了keep-alive也没用
// (因为它只是防止你的组件被销毁,而你的组件没有被销毁,是在点击切换数据)
// 解决:外面现在用的是同一个数组切换数据(多个ArticleList用的是同一个数组,换会影响别人)
//      文章列表数据,请求,数组,分别放入到ArticleList内部(自己请求自己的数据)
//      外面只负责只负责传入当前激活的频道ID
export default {
  data() {
    return {
      channelId: 0, // tab导航-激活频道ID(默认频道ID为0,页面刚打开是推荐频道高亮-对应文章数据)
      userChannelList: [], // 用户选择频道列表
      allChannelList: [], // 所有频道列表
      // articleList: [] // 文章列表，放到ArticleList中去了
      show: false, // 频道弹出层显示/隐藏
      channelScrollTObj: {} // 保存每个频道的滚动位置 {推荐频道Id:滚动距离,html频道Id:滚动距离,...}
    }
  },
  async created() {
    // 频道列表
    const res = await getUserChannelsAPI()
    console.log(res, '用户频道')
    this.userChannelList = res.data.data.channels // 把请求回来的频道列表,转存到data中

    // 首次打开页面时,调用channelChangeFn()方法获取文章列表数据
    // this.channelChangeFn()

    // 所有频道列表
    const res2 = await getAllChannelsAPI()
    console.log(res2, '所有频道')
    this.allChannelList = res2.data.data.channels
  },
  methods: {
    // tabs频道栏切换的事件
    channelChangeFn() {
      // 获取文章列表的数据 -> 放到ArticleList中去了
      // const res2 = await getAllArticleListAPI({
      //   channel_id: this.channelId, // 先默认请求 推荐 频道数据
      //   timestamp: new Date().getTime()
      // })
      // console.log(res2)
      // this.articleList = res2.data.data.results

      // tab切换以后,设置滚动条的位置
      // tab切换时,这个vant组件内部,会把切走的容器height设置为0,滚动条因为没有高度就回到了顶部
      // 切回来的一瞬间,没有高度,滚动事件从底下上来也被触发了,所以才把数据设置为0
      // 切回来的一瞬间高度为0,你设置滚动位置也无用
      this.$nextTick(() => {
        document.documentElement.scrollTop =
          this.channelScrollTObj[this.channelId]
        document.body.scrollTop = this.channelScrollTObj[this.channelId]
      })
    },

    // +号的点击方法
    plusClickFn() {
      this.show = true
    },
    // 添加频道
    async addChannelFn(channelObj) {
      // 1: 把新增的频道保存到 用户选择的频道列表中
      this.userChannelList.push(channelObj)
      // 问题：为何只需要push，不需要从下边数组里移除
      // 答：因为 未选择频道数组 是一个计算属性，当它的依赖项发生改变时，计算属性就会重新进行过滤计算！！真香
      // 2: 还要把最新的数组,发送给后台_以下为更新数组过程
      // 接口文档要求推荐频道不能传递,所以先过滤掉id为0的推荐频道
      const newArr = this.userChannelList.filter((item) => item.id !== 0)
      // 数组里对象字段->转换
      const theNewArr = newArr.map((item, index) => {
        // 因为filter筛选后newArr数组里的对象还是userChannelList数组里的对象,地址是一样的,所以name被删除了,因此这里使用map()方法过滤
        // 浅拷贝(让对象和原数组脱离关系)  es6
        const newObj = { ...item }
        // 删除对象里name键值对
        delete newObj.name
        newObj.seq = index

        return newObj // 让map方法把新对象收集起来形成一个新数组
      })
      const res = await updateChannelsAPI({
        channels: theNewArr
      })
      console.log(res, '添加频道')
    },
    // 删除频道
    async removeChannelFn(channelObj) {
      const index = this.userChannelList.findIndex(
        (obj) => obj.id === channelObj.id
      )
      // .splice(index,1) 会把数组中索引为index的元素删除,该方法会直接改变原数组
      this.userChannelList.splice(index, 1)

      // 方式1:把现在用户数组的数据,再重置式的发给后台
      // 需要把上面的更新数组过程,封装一个函数,addChannelFn和removeChannelFn里进行调用(笔记里有)
      // 方式2:只调用删除接口
      const res = await removeTheChannelAPI({ channelId: channelObj.id })
      console.log(res, '删除频道')
      // 知道:删除接口返回状态码204(no content) 无返回内容
    },
    // 关闭弹出层
    closeFn() {
      this.show = false
      // 方式2:在父组件中(index.vue)使用ref引用,拿到该子组件
      this.$refs.editRef.isEdit = false
    },
    // 首页-右上角放大镜点击事件->跳转搜索页面
    moveSearchPageFn() {
      this.$router.push('/search')
    },
    // 监听网页的滚动事件
    scrollFn() {
      this.$route.meta.scrollT = document.documentElement.scrollTop
      // 同时保存当前频道的滚动距离
      // 动态的给对象中的某个键赋值,用[]
      this.channelScrollTObj[this.channelId] =
        document.documentElement.scrollTop || document.body.scrollTop
      // console.log(this.channelScrollTObj)
    }
  },
  components: {
    ArticleList,
    ChannelEdit
  },
  // 计算属性
  computed: {
    // 未选择的频道数组
    unCheckChannelList() {
      // 目标：把所有频道数组的对象逐个取出，去用户已选频道数组中查找，如果找不到，则让filter方法收集到一个新的数组里边
      const newArr = this.allChannelList.filter((bigObj) => {
        const index = this.userChannelList.findIndex((smallObj) => {
          return bigObj.id === smallObj.id
        })

        // 如果找到了就过滤走，如果找不到，则留下来，放到数组中
        if (index > -1) {
          return false
        } else {
          return true
        }
      })
      return newArr
    }
  },
  // 组件被激活时，会自动触发组件的actived生命周期函数
  activated() {
    console.log(this.$route, '激活组件时的路由对象')
    window.addEventListener('scroll', this.scrollFn) // 规定:里面的scrollFn不用加小括号
    // window和document监听网页滚动的事件
    // html标签获取scrollTop,滚动的距离,和设置滚动的位置(被写入值)
    // 立刻设置滚动条的位置
    // 照顾不同浏览器获取scrollTop方式的不一致，代码写两个即可
    document.documentElement.scrollTop = this.$route.meta.scrollT
    document.body.scrollTop = this.$route.meta.scrollT
  },
  // 组件被缓存时，会自动触发组件的deactived生命周期函数
  deactivated() {
    window.removeEventListener('scroll', this.scrollFn) // 规定:里面的scrollFn不用加小括号
  }
}
</script>

<style lang="less" scoped>
.logo {
  width: 50px;
  height: 50px;
  background-color: pink;
}
.main {
  padding-top: 46px;
}
// 设置 tabs 容器的样式，给他一个右内边距，防止被固定定位的+号挡住
/deep/ .van-tabs__wrap {
  padding-right: 30px;
  background-color: #fff;
}
// 设置+号这个小图标的样式
.moreChannels {
  position: fixed;
  top: 62px;
  right: 8px;
  z-index: 999;
}

// 设置频道管理的弹出层的样式
.channel_popup {
  width: 100vw;
  height: 100vh;
  // 如果想给100%，要先给html和body设置100%
  // vw和vh是css3新出的单位，参考的是浏览器窗口的百分比
}
</style>
