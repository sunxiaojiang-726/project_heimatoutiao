<template>
  <div>
    <van-nav-bar title="地大头条" />
    <!-- van-form整体表单组件
    @submit 自定义提交事件

    van-field输入框（表单一项）
    :rules 验证规则 :动态属性
    required 星号
    -->
    <van-form @submit="onSubmit">
      <van-field
        v-model="user.mobile"
        required
        name="mobile"
        label="手机号"
        placeholder="请输入11位手机号"
        :rules="[
          { required: true, message: '请填写手机号', pattern: /^1[3-9]\d{9}$/ }
        ]"
      />
      <van-field
        v-model="user.code"
        required
        type="password"
        name="code"
        label="密码"
        placeholder="请输入6位密码"
        :rules="[{ required: true, message: '请填写密码', pattern: /^\d{6}$/ }]"
      />
      <div style="margin: 16px">
        <!-- 圆形 块级元素  native-type:原生button标签的type属性,提交整个表单数据的按钮-->
        <van-button
          round
          block
          type="info"
          native-type="submit"
          :disabled="isLoading"
          :loading="isLoading"
          loading-text="正在登录ing..."
          >登录</van-button
        >
      </div>
    </van-form>
  </div>
</template>

<script>
// 写需求套路
// 1. html+css
// 2. 数据铺设,数据绑定,数据微调
// 3. js交互->事件/正则

// 组件使用套路
// 1.明确目标，找到类似组件
// 2.引入注册然后复制使用(标签和js复制)
// 3.读和删没用的
// 4.修改，改成我们想要的样子
// (1):找到类名，自己写css覆盖掉它
// (2):看文档，是否支持自定义样式

// 目标1：实现顶部导航->自定义样式
// 目标2：实现表单组件->读，改，加
// 目标3：收集值后，调用接口->查看登录结果
// 目标4：点击登录后给用户提示(正在登陆~~~)，防止用户频繁的点击
import { loginAPI } from '@/api/index.js'
import { setToken } from '@/utils/token.js'
import { setStorage } from '@/utils/storage.js'
// Notify组件的函数调用
import Notify from '@/ui/Notify.js'
export default {
  name: 'Login',
  data() {
    return {
      user: {
        mobile: '18339197800', // 手机号
        code: '246810' // 验证码(密码-必须是246810 后台规定死的，无论手机号是什么)
      },
      isLoading: false // 登录按钮-加载状态,刚开始不显示加载; 登录按钮-禁用状态，刚开始不禁用
    }
  },
  methods: {
    // 提交方法（需要form整体通过验证才能提交）
    async onSubmit(values) {
      // values可以直接用(是一个收集参数名和值的对象) === this.user，用哪个都可以
      // console.log(values)
      // console.log(this.user)

      // 状态设置
      this.isLoading = true

      try {
        const res = await loginAPI(this.user)
        console.log(res, '登录成功')
        Notify({ type: 'success', message: '求真务实！\n艰苦朴素！' })
        // 存储token
        setToken(res.data.data.token)
        setStorage('refresh_token', res.data.data.refresh_token) // 用于token续签
        // 跳转一定要写在最后->尽量最后执行
        // 不用location.href的原因，当前浏览器地址和要跳转的地址不一样时，会导致刷新网页
        // 因为登录之后不需要后退，所以用replace
        this.$router.replace({
          // 因为我们路由规则/layout里没有重定向，所以直接在这里写全
          path: this.$route.query.path || '/layout/home'
        })
      } catch (err) {
        // Promise内ajax抛出错误，直接进入这里
        Notify({ type: 'danger', message: '账号或密码错误' })
      }

      this.isLoading = false // 网络请求完成，无论是成功还是失败，把加载与禁用状态关闭
    }
  }
}
</script>

<style lang="less" scoped>
// // 去调试工具找到之后改
// .van-nav-bar {
//   background-color: rgb(51, 183, 192);
// }
// // 后代选择器
// /deep/ .van-nav-bar__title {
//   color: #b4183f;
//   font-size: 20px;
// }
</style>
