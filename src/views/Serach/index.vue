<template>
  <div>
    <!-- 搜索页面头部 -->
    <div class="search-header">
      <!-- 后退按钮 -->
      <van-icon
        name="arrow-left"
        color="green"
        size="0.48rem"
        class="goback"
        @click="$router.back()"
      />
      <!-- 搜索组件 -->
      <van-search
        v-model.trim="kw"
        v-fofo
        placeholder="请输入搜索关键词"
        background="pink"
        shape="round"
        @input="inputFn"
        @search="searchFn"
      />
    </div>

    <!-- v-if-else控制 搜索建议列表 和 搜索历史 不能同时出现 -->
    <!-- 搜索建议列表 -->
    <div class="sugg-list" v-if="kw.length !== 0">
      <div
        class="sugg-item"
        v-for="(str, index) in suggestList"
        :key="index"
        v-html="lightFn(str, kw)"
        @click="suggestClickFn(str)"
      ></div>
    </div>

    <!-- 搜索历史 -->
    <div class="search-history" v-else>
      <!-- 标题 -->
      <van-cell title="搜索历史">
        <!-- 使用 right-icon 插槽来自定义右侧图标 -->
        <template #right-icon>
          <van-icon name="delete" class="search-icon" @click="clearFn" />
        </template>
      </van-cell>
      <!-- 历史列表 -->
      <div class="history-list">
        <span
          class="history-item"
          v-for="(str, index) in history"
          :key="index"
          @click="historyClickFn(str)"
          >{{ str }}</span
        >
      </div>
    </div>
  </div>
</template>

<script>
// 目标1: 跳转到搜索结果页面
// 1. 输入框回车 -> 把输入框字 -> 搜索结果页
// 2. 点击联想菜单 -> 点击文字 -> 搜索结果页
// 3. 点击历史记录 -> 点击文字 -> 搜索结果页

// 目标2: 输入框按回车,保存搜索词值; 点联想菜单的项,保存菜单项值
import { suggestListAPI } from '@/api/index.js'
import { setStorage, getStorage } from '@/utils/storage.js'
export default {
  name: 'Search',
  data() {
    return {
      kw: '', // 搜索关键字
      timer: null, // 防抖的定时器
      suggestList: [], // 联想建议列表文字数组
      history: JSON.parse(getStorage('history')) || [] // 搜索历史
    }
  },
  methods: {
    // 输入框 - 内容实时改变触发的事件
    inputFn() {
      clearTimeout(this.timer)
      if (this.kw.length === 0) {
        // 如果输入框没有值,则清空搜索建议列表
        this.suggestList = []
      } else {
        // 防抖: 延时执行逻辑代码,事件再次触发时,清除上一个定时器
        this.timer = setTimeout(async () => {
          const res = await suggestListAPI({ keywords: this.kw })
          console.log(res, '联想菜单')
          this.suggestList = res.data.data.options
        }, 300)
      }
    },
    // 专门处理字符串高亮关键字
    lightFn(originStr, target) {
      // originStr 原来的字符串
      // target 关键字
      // 字符串.replace() 该方法默认只替换了第一个出现的target
      // 字符串.replaceAll() 该方法替换字符串中所有的target
      // 返回值:替换后的完整字符串

      // 如果你要使用变量, 作为正则的匹配条件, 不能用语法糖简化写法
      // i代表的忽略大小写,g代表全局都匹配(即输入java,所有的Java,JAVA联想菜单无论大小写都高亮)
      const reg = new RegExp(target, 'ig')

      // 替换后的值不能用target
      // 例如:输入框里 java, 匹配回来的联想菜单JAVA,Java,jAVA都被你replace换成输入框target值java
      return originStr.replace(reg, (match) => {
        // match就是匹配中的时候,原字符串里的那个字符,用人家原来的,我们给个颜色即可
        return `<span style="color:red;">${match}</span>`
      })
    },
    // 封装 搜索跳转 方法
    moveFn(theKw) {
      // 坑: 路由跳转,在watch之前执行(watch侦听器中中还没有把history存到本地,就已经跳走了),所以我们要让定时器包裹路由跳转,根据eventLoop可知,先会执行监听器
      setTimeout(() => {
        this.$router.push({ path: `/search_result/${theKw}` })
      }, 0)
    },
    // 输入框 - 搜索事件
    searchFn() {
      // 搜索关键字 --- 保存到数组里
      if (this.kw.length > 0) {
        this.history.push(this.kw)
        this.moveFn(this.kw)
      }
    },
    // 联想菜单 - 点击事件
    suggestClickFn(str) {
      this.history.push(str)

      this.moveFn(str)
    },
    // 历史记录 - 点击事件
    historyClickFn(str) {
      this.moveFn(str)
    },
    // 清空搜索历史
    clearFn() {
      this.history = []
    }
  },
  // watch侦听器使用
  watch: {
    // 历史记录数组的变化
    history: {
      // 数组不能直接监听到里边元素的变化,需要开启深度监听
      deep: true,
      handler() {
        // 立刻覆盖式地保存到本地
        // 保存到本地之前,给数组去重
        // ES6新增了2种引用类型(以前Array,Object),(新增:Set Map)
        // Set: 无序不重复的value集合体(无下角标)
        // 特点: 你传入的数据类型,如果有重复元素,会自动清理掉重复元素,返回无重复Set对象
        // 注意：如果数组中的值是对象，比较的是对象的内存地址
        const theSet = new Set(this.history)
        // Set类型 -> 转回 -> 数组类型
        const arr = Array.from(theSet)

        // 因为浏览器本地只能存字符串,不能直接存数组
        setStorage('history', JSON.stringify(arr))
      }
    }
  }
}
</script>

<style scoped lang="less">
// 搜索头部样式
.search-header {
  height: 46px;
  display: flex;
  align-items: center;
  background-color: pink;
  overflow: hidden;
  /*后退按钮*/
  .goback {
    padding-left: 14px;
  }
  /*搜索组件*/
  .van-search {
    flex: 1;
  }
}

/*搜索建议列表样式 */
.sugg-list {
  .sugg-item {
    padding: 0 15px;
    border-bottom: 1px solid #f8f8f8;
    font-size: 14px;
    line-height: 50px;
    // 实现省略号的三行代码
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/**搜索历史样式 */
.search-icon {
  font-size: 16px;
  line-height: inherit;
}
.history-list {
  padding: 0 10px;
  .history-item {
    display: inline-block;
    font-size: 12px;
    padding: 8px 14px;
    background-color: #efefef;
    margin: 10px 8px 0px 8px;
    border-radius: 10px;
  }
}
</style>
