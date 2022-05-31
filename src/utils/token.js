// 此文件->封装3个方法->专门用来操作token
// 只要一封装点东西：目的：代码分层，更方便清晰，以后修改方便

// 设置
const key = 'token'
export const setToken = (token) => localStorage.setItem(key, token)

// 获取
export const getToken = () => localStorage.getItem(key)

// 删除
export const removeToken = () => localStorage.removeItem(key)
