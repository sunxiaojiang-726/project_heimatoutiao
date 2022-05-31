// 封装本地存储的方式
// 整个项目使用localStorage,还是sessionStorage,还是token
// 只需要改变这里即可
// 封装:为了统一管理,方便以后的替换和修改
export const setStorage = (key, value) => {
  localStorage.setItem(key, value)
}

export const getStorage = (key) => {
  // 获取时,需要return
  return localStorage.getItem(key)
}

export const removeStorage = (key) => {
  localStorage.removeItem(key)
}

// 左边放大镜的地方,可以把整个项目中用到localStorage的地方全部换掉.
// 专门操作token的localStorage不用换,那是人家自己的
