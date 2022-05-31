<template>
  <div class="user-edit-container">
    <!-- Header 区域 -->
    <van-nav-bar
      title="编辑资料"
      left-arrow
      @click-left="$router.back()"
      fixed
    />

    <!-- 用户资料 -->
    <van-cell-group class="action-card">
      <van-cell title="头像" is-link center>
        <template #default>
          <van-image
            round
            class="avatar"
            :src="profileObj.photo"
            @click="imageClickFn"
          />
          <!-- file 选择框 -->
          <!-- 视觉上隐藏，标签还在DOM树上，还可以触发功能 -->
          <input
            type="file"
            ref="iptFile"
            v-show="false"
            accept="image/*"
            @change="onFileChange"
          />
        </template>
      </van-cell>
      <van-cell
        title="名称"
        is-link
        :value="profileObj.name"
        @click="nameClickFn"
      />
      <van-cell
        title="生日"
        is-link
        :value="profileObj.birthday"
        @click="birthdayClickFn"
      />
    </van-cell-group>

    <!-- 姓名修改弹窗 - dialog采取组件调用 之前采用的是 -->
    <van-dialog
      v-model="show"
      title="修改名称"
      show-cancel-button
      :before-close="beforeCloseFn"
    >
      <input v-fofo type="text" v-model="inputUserName" />
    </van-dialog>

    <!-- 时间选择器 -->
    <!-- 组件可以自己搭配使用，给时间选择器组件 加一个 van-popup弹出层组件 -->
    <van-popup
      v-model="dataTimePickerShow"
      position="bottom"
      :style="{ height: '50%' }"
      round
    >
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        title="选择年月日"
        :min-date="minDate"
        :max-date="maxDate"
        @cancel="dateCancelFn"
        @confirm="dateConfirmFn"
      />
    </van-popup>
  </div>
</template>

<script>
import {
  userProfileAPI,
  updateUserPhotoAPI,
  updateUserProfileAPI
} from '@/api/index.js'
import Notify from '@/ui/Notify.js'
import { formatDate } from '@/utils/data.js'
import { mapMutations } from 'vuex'
export default {
  data() {
    return {
      profileObj: {}, // 编辑页面信息对象
      show: false, // 修改名称弹出框的显示与隐藏
      inputUserName: '', // 修改名字-弹出框内输入框绑定的值
      minDate: new Date(1920, 0, 1), // 最小时间
      maxDate: new Date(), // 最大时间(默认获取系统的日期,出生日期最多是现在)
      currentDate: new Date(), // 当前时间(组件当前显示时间,每次点开日期组件,默认显示当前用户的出生日期)
      dataTimePickerShow: false // 日期选择器 - 弹出层显示/隐藏
    }
  },
  name: 'UserEdit',
  async created() {
    const res = await userProfileAPI()
    console.log(res, '编辑页面信息')
    // 转存到data中
    this.profileObj = res.data.data
  },
  methods: {
    ...mapMutations(['SET_USERPHOTO']),
    ...mapMutations(['SET_USERNAME']),
    // 文件选择改变 - 事件
    async onFileChange(e) {
      if (e.target.files.length === 0) return // 用户可能没有选择
      console.log(e.target.files[0], '用户选择的头像') // (用户选中的文件对象)数组其实是一个特殊的对象
      // 创建FormData对象
      const theFd = new FormData()
      theFd.append('photo', e.target.files[0]) // 请求体里加入一对参数名和值

      const res = await updateUserPhotoAPI(theFd)
      console.log(res, '上传头像')
      // 不需要刷新重新获取，可以局部修改页面上profileObj.photo的值
      this.profileObj.photo = res.data.data.photo
      // 更新成功后,同步到vuex中
      this.SET_USERPHOTO(res.data.data.photo)
    },
    // 图片 - 点击事件
    imageClickFn() {
      this.$refs.iptFile.click() // JS模拟input标签的事件触发
    },
    // 名称 - 点击事件
    nameClickFn() {
      this.show = true
      this.inputUserName = this.profileObj.name
    },
    // 名称 - 弹出框 - 关闭前的回调函数
    async beforeCloseFn(action, done) {
      // console.log(action)
      // action有两个可能，要么是confirm(用户点击了确定)，要么是concel(用户点击了取消)
      if (action === 'confirm') {
        // 用户点击了“确定”
        // 计算机中，对字符(文字)有多种编码方式
        // 计算机眼中只有0和1，计算机把“今晚”变成0/1形式 -> 编码成 一种表现形式
        // utf-8 编码     “今晚”  展示成 \xe4\xbb\x8a\xe6\x99\x9a
        // url 编码       “今晚”  展示成 %E4%BB%8A%E6%99%9A%0A
        // unicode 编码   “今晚”  展示成 \u4eca\u665a
        // \u4e00-\u9fa5 就是unicode编码 汉字：一-龥
        const reg = /^[a-zA-Z0-9\u4e00-\u9fa5]{1,11}$/ // 定义一个正则表达式-匹配1-11位的中文、数字、字母组合
        if (reg.test(this.inputUserName) === true) {
          // 通过了校验
          const res = await updateUserProfileAPI({
            name: this.inputUserName
          })
          console.log(res, '更改名称')
          this.profileObj.name = this.inputUserName // 更新成功 - 回显到页面上
          // this.$store.commit('SET_USERNAME', this.inputUserName) // 方式1 直接使用
          this.SET_USERNAME(this.inputUserName) // 方式2 映射使用
          done()
        } else {
          // 没有通过校验，给出提示
          Notify({ type: 'warning', message: '用户名只能是1-11位中英数字组合' })
          done(false) // 阻止弹窗关闭
        }
      } else {
        // 用户点击了“取消”
        done() // 调用done(),让弹窗关闭
      }
    },
    // 生日单元格 - 点击事件
    birthdayClickFn() {
      this.dataTimePickerShow = true // 时间选择器出现
      // 数据和页面显示 年-月-日 格式的字符串
      // 而currentDate要的是日期对象
      this.currentDate = new Date(this.profileObj.birthday)
    },
    // 日期选择器 - 取消事件
    dateCancelFn() {
      this.dataTimePickerShow = false
    },
    // 日期选择器 - 确认事件
    async dateConfirmFn() {
      // 日期选择器组件里的currentDate是日期对象，后端要的是 年-月-日 字符串
      const res = await updateUserProfileAPI({
        birthday: formatDate(this.currentDate)
      })
      console.log(res, '更改出生日期')
      // 回显出生日期，让单元格同步
      this.profileObj.birthday = formatDate(this.currentDate)
      this.dataTimePickerShow = false
    }
  }
}
</script>

<style lang="less" scoped>
.user-edit-container {
  padding-top: 46px;
  .avatar {
    width: 50px;
    height: 50px;
  }
}

// 去调试页面找到类名，加上去不行的话，就加/deep/
/deep/ .van-dialog__content {
  text-align: center;
  // 调一下输入框的样式
  input {
    padding: 0;
    outline: none;
    border: none;
    text-align: center;
  }
}
</style>
