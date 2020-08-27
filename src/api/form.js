import request from '@/utils/request'
// 表单提交
export function postForm(url, data) {
  return request({ url: url, method: 'post', data })
}
