import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 树表组件
import TreeTable from 'vue-table-with-tree-grid'
// 富文本组件
import VueQuillEditor from 'vue-quill-editor'
// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// axios
import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)
Vue.prototype.$http = axios
Vue.config.productionTip = false
// 根据请求结果显示nessage
Vue.prototype.$showMessage = function (data, status, flag) {
  if (data.meta.status !== status) {
    return this.$message.error(data.meta.msg)
  }
  flag && this.$message.success(data.meta.msg)
}
// 格式化时间

Vue.filter('dateFormat', function (value) {
  const dt = new Date(value)
  // 年
  const y = dt.getFullYear()
  // 月
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  // 日
  const d = (dt.getDate() + '').padStart(2, '0')
  // 时
  const hh = (dt.getHours() + '').padStart(2, '0')
  // 分
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  // 秒
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}/${m}/${d}  ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
