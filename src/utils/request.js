import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10000 // request timeout
})

// axios.defaults.retry = 4
// service.defaults.retryDelay = 1000

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['X-Token'] = getToken()
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    const statusCode = res.code || response.status // 直接获取http相应码而不再去data里获取code
    // 响应码不是200, 解析返回的错误
    if (statusCode !== 200) { // 服务端自定义错误信息字段为 message
      // Message({ message: res.message || 'Error', type: 'error', duration: 5 * 1000 })
      // 508: Illegal token; 512: Other clients logged in; 514: Token expired;
      if (statusCode === 508 || statusCode === 512 || statusCode === 514) {
        // to re-login
        MessageBox.confirm('你已经登出了账户, 你可以关闭这个页面，或者重新登录', '确认登出', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      // console.log('返回错误：' + res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('请求/响应失败：' + error) // for debug
    Message({ message: error.message, type: 'error', duration: 15 * 1000 })
    return Promise.reject(error)
  }
)

export default service
