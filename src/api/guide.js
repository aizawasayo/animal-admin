import request from '@/utils/request'

export function getGuides(params) {
  return request({
    url: 'admin/guide',
    method: 'get',
    params
  })
}

export function addGuide(data) {
  return request({
    url: 'admin/guide',
    method: 'post',
    data
  })
}

export function getGuide(id) {
  return request({
    url: 'admin/guide/' + id,
    method: 'get'
  })
}

export function deleteGuide(id) {
  return request({
    url: 'admin/guide/' + id,
    method: 'delete'
  })
}

export function getPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: {
      pv
    }
  })
}
