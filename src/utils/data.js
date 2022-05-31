// 封装专门处理时间的方法
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime' // 到指定时间需要的插件
import 'dayjs/locale/zh' // 集成中文

// JSDOC注释,文档注释
/**
 * .....多久之前
 * @param {*} 之前的时间
 * @returns 系统时间到之前指定时间的距离值
 */
export const timeAgo = (targetTime) => {
  // 格式化时间
  dayjs.extend(relativeTime)
  dayjs.locale('zh')
  const a = dayjs()
  const b = dayjs(targetTime)
  return a.to(b) // 返回多久之前...
}

// 该方法把 日期对象，转换为 '2018-12-20' 格式的字符串
export const formatDate = (dataObj) => {
  return dayjs(dataObj).format('YYYY-MM-DD')
}
