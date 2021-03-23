import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

// import * as ：一次性导入包含全部变量的模块对象
import * as filters from './filters' // global filters
// 导入模块中 名为 globalComs 的 变量
import { globalComs } from './globalComs'

import * as commonApi from '@/utils/common'
Vue.prototype.commonApi = commonApi

Vue.prototype.apiUrl = process.env.VUE_APP_BASE_API

// 批量注册全局公共组件
// import UploadSingle from '@/components/Upload/SingleUpload'
// Vue.component('upload-single', UploadSingle)
globalComs.forEach(item => {
  Vue.component(item.name, item.component)
})

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  // const {
  //   mockXHR
  // } = require('../mock')
  // mockXHR()
}

// set ElementUI lang to CN
Vue.use(ElementUI, {
  locale,
  size: Cookies.get('size') || 'medium' // set element-ui default size
})
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})


Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
