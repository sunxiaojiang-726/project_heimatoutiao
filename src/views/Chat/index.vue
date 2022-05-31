<template>
  <div class="container">
    <!-- 固定导航 -->
    <van-nav-bar
      fixed
      left-arrow
      @click-left="$router.back()"
      title="小江同学"
    ></van-nav-bar>

    <!-- 聊天主体区域 -->
    <div class="chat-list">
      <!-- 要循环谁，就给谁加上v-for -->
      <div v-for="(obj, index) in list" :key="index">
        <!-- 左侧是机器人小思 -->
        <!-- 如果这句话不是我说的，则在左边显示(如果是聊天室，还可能是别人说的) -->
        <div class="chat-item left" v-if="obj.name !== 'me'">
          <van-image
            fit="cover"
            round
            src="https://img.yzcdn.cn/vant/cat.jpeg"
          />
          <div class="chat-pao">{{ obj.msg }}</div>
        </div>

        <!-- 右侧是当前用户 -->
        <div class="chat-item right" v-else>
          <div class="chat-pao">{{ obj.msg }}</div>
          <van-image fit="cover" round :src="$store.state.userPhoto" />
        </div>
      </div>
    </div>

    <!-- 对话区域 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model="word" placeholder="说点什么...">
        <template #button>
          <span style="font-size: 12px; color: #999" @click="sendFn">提交</span>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script>
// 按需导入 socket.io-client 包 的 io方法
import { io } from 'socket.io-client'
import { getToken } from '@/utils/token.js'
export default {
  name: 'Chat',
  data() {
    return {
      word: '', // 输入框的内容
      list: [
        // 所有的聊天消息
        // 只根据 name 属性，即可判断出这个消息应该渲染到左侧还是右侧
        { name: 'xs', msg: 'hi，你好！我是小江' }
      ],
      socket: null // 客户端和服务器端建立连接的socket对象
    }
  },
  created() {
    // 注意：io是建立socket连接，和axios没有一毛钱关系
    // 创建客户端 websocket 的实例
    this.socket = io('http://toutiao.itheima.net', {
      query: {
        token: getToken() // 接口文档
      },
      transports: ['websocket']
    })

    // 测试下是否连接成功
    this.socket.on('connect', () => {
      console.log('连接建立成功')
    })

    // 接收后端传回来的消息
    this.socket.on('message', (obj) => {
      // 把服务器发送过来的消息，存储到 list 数组中 -> v-for更新
      this.list.push({
        name: 'xs',
        msg: obj.msg
      })

      // 最后一条聊天消息滚动到屏幕范围
      // 注意点：data数据变化，DOM更新是异步的，所以获取到的是上一条div
      // 解决：使用this.$nextTick()来延迟回调函数中代码的执行，延时到DOM被重新渲染完毕
      this.$nextTick(() => {
        // 获取到所有的聊天 Item 项
        const chatItem = document.querySelectorAll('.chat-item')
        // 获取到最后一项对应的 DOM 元素
        const lastItem = chatItem[chatItem.length - 1]
        // 调用 scrollIntoView() 方法，显示这个元素
        lastItem.scrollIntoView({
          behavior: 'smooth' // 动画平滑
        })
      })
    })
  },
  methods: {
    // 发送 - 点击事件
    sendFn() {
      if (this.word.trim().length === 0) return
      // 用socket连接对象.emit('后端接收消息的事件名',值)
      this.socket.emit('message', {
        msg: this.word,
        timestamp: new Date().getTime()
      })

      // 把消息显示到页面上
      this.list.push({
        name: 'me',
        msg: this.word
      })

      this.$nextTick(() => {
        // 获取到所有的聊天 Item 项
        const chatItem = document.querySelectorAll('.chat-item')
        // 获取到最后一项对应的 DOM 元素
        const lastItem = chatItem[chatItem.length - 1]
        // 调用 scrollIntoView() 方法，显示这个元素
        lastItem.scrollIntoView({
          behavior: 'smooth' // 动画平滑
        })
      })

      // 清空输入框
      this.word = ''
    }
  },
  // 组件被销毁之前，清空 socket 对象
  beforeDestroy() {
    this.socket.close() // 关闭连接
    this.socket = null // 销毁 websocket 实例对象
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background: #fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item {
      padding: 10px;
      .van-image {
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao {
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before {
          content: '';
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top: 0.5px solid #c2d9ea;
          border-right: 0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right {
  text-align: right;
  .chat-pao {
    margin-left: 0;
    margin-right: 15px;
    &::before {
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left {
  text-align: left;
  .chat-pao {
    margin-left: 15px;
    margin-right: 0;
    &::before {
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
