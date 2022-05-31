<template>
  <div>
    <!-- 一条文章单元格 -->
    <van-cell>
      <!-- 标题区域的插槽 -->
      <template #title>
        <div class="title-box">
          <!-- 标题 -->
          <span>{{ artObj.title }}</span>
          <!-- 单张图片 -->
          <!-- <img
            v-if="artObj.cover.type === 1"
            class="thumb"
            :src="artObj.cover.images[0]"
          /> -->
          <!-- 不再使用原生img标签，而是使用van-image组件，在图片404时给出提示 -->
          <van-image
            v-if="artObj.cover.type === 1"
            class="thumb"
            :src="artObj.cover.images[0]"
            lazy-load
          >
            <template v-slot:error>图片走丢了</template>
          </van-image>
        </div>
        <!-- 多张图片 -->
        <div class="thumb-box" v-if="artObj.cover.type > 1">
          <!-- <img
            v-for="(imgUrl, index) in artObj.cover.images"
            :key="index"
            class="thumb"
            :src="imgUrl"
          /> -->
          <!-- 使用van-image组件，在图片404时给出提示 -->
          <van-image
            v-for="(imgUrl, index) in artObj.cover.images"
            :key="index"
            class="thumb"
            :src="imgUrl"
            lazy-load
          >
            <template v-slot:error>图片走丢了</template>
          </van-image>
        </div>
      </template>
      <!-- label 区域的插槽 -->
      <template #label>
        <div class="label-box">
          <div>
            <span>{{ artObj.aut_name }}</span>
            <span>{{ artObj.comm_count }}评论</span>
            <span>{{ formateTime(artObj.pubdate) }}</span>
          </div>
          <!-- 反馈按钮 -->
          <!-- 注意:需要给反馈按钮阻止事件冒泡,防止在点击x时,触发包裹它的组件上的路由跳转事件(跳转到详情) -->
          <van-icon name="cross" @click.stop="show = true" v-if="isShow" />
        </div>
      </template>
    </van-cell>
    <!-- 反馈面板 -->
    <van-action-sheet
      v-model="show"
      :actions="actions"
      @select="onSelect"
      get-container="body"
      :cancel-text="bottomText"
      @cancel="cancelFn"
      @close="closeFn"
    />
  </div>
</template>

<script>
// 目标1：点击"反馈垃圾内容",进行数据的切换
// 1. 监听点击事件,区分用户点击的时哪一个
// 2. 切换actions数组里边的数据

// 目标2：二级反馈数据出现，取消按钮的文字要换成返回
// :cancel-text="bottomText" 设置变量，onSelect中，把变量值换成“返回”

// 目标3：点击底部按钮，要区分判断
// 1. 给 反馈面板 标签绑定 @cancel 取消事件和事件方法
// 2. 在里面用 bottomText 的值，判断用户点击的是否为“返回”
// 如果是，把 actions 数据源换回成 firstActions
// 把 bottomText 的文字换成取消
// 强制让反馈面板留下来 this.show = true
import { timeAgo } from '@/utils/data.js'
import { firstActions, secondActions } from '@/api/report.js'
export default {
  props: {
    artObj: Object, // 文章对象
    isShow: {
      type: Boolean,
      default: true // 例如首页的地方，我不想再去动了，首页肯定没传isShow的值进来，所以首页需要显示
    }
  },
  data() {
    return {
      show: false, // 反馈面板显示/隐藏
      actions: firstActions,
      bottomText: '取消' // 底部按钮的文字，默认是取消
    }
  },
  methods: {
    // 注意外部导入的方法不能直接在模板上使用,需要在Script区域做个预处理
    formateTime: timeAgo, // 函数体是timeAgo
    // 反馈面板-“选项”选择事件
    onSelect(action, item) {
      // console.log(action) // action代表反馈选项这个对象 {name: '不感兴趣'}
      // console.log(item) // 点击的索引值 0
      // 默认情况下点击选项时不会自动收起
      // 可以通过 close-on-click-action 属性开启自动收起
      // 判断是否点击的是
      if (action.name === '反馈垃圾内容') {
        // 切换actions数组里边的数据
        this.actions = secondActions
        this.bottomText = '返回'
      } else if (action.name === '不感兴趣') {
        // 使用子向父传值，在ArticleList组件中，请求 不感兴趣 的接口
        // 也可以在本组件中请求 不感兴趣 的接口，但是代码内聚性不高，不好管理而已
        this.$emit('disLikeEV', this.artObj.art_id)
        this.show = false // 无论成功或失败，直接让反馈面板隐藏
      } else {
        // 二级反馈选项
        this.$emit('reportEV', this.artObj.art_id, action.value)
        this.show = false // 关闭 - 下面的cancelFn会帮你把反馈选项切回来
      }
    },
    // 反馈面板-底部按钮-点击事件
    cancelFn() {
      if (this.bottomText === '返回') {
        this.show = true
        this.actions = firstActions
        this.bottomText = '取消'
      }
    },
    // 反馈面板-关闭面板-触发事件
    closeFn() {
      // 每次关闭面板，偷偷把 反馈面板换回一级数据
      this.actions = firstActions
      this.bottomText = '取消'
    }
  }
}
</script>

<style scoped lang="less">
/* 标题样式 */
.title-box {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

/* label描述样式 */
.label-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 文章信息span */
.label-box span {
  margin: 0 3px;
  &:first-child {
    margin-left: 0;
  }
}

/* 图片的样式, 矩形黄金比例：0.618 */
.thumb {
  width: 113px;
  height: 70px;
  background-color: #f8f8f8;
  object-fit: cover;
}

/* 三图, 图片容器 */
.thumb-box {
  display: flex;
  justify-content: space-between;
}
</style>
