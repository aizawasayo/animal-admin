import {
  Message,
  MessageBox,
} from 'element-ui'

/**
 * 删除数据
 * @id {(string)} 多个id用 , 分隔
 * @deleteFun {Function} 删除数据调用的Api方法
 * @callback {Function} 删除成功的回调
 * @returns {null}
 */
const deleteById = (id, deleteFun, callback) => {
  MessageBox.confirm('是否要永久删除该信息', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warn'
  })
    .then(() => {
      deleteFun(id).then(res => {
        Message({ type: 'success', message: res.message })
        callback()
      })
    })
    .catch(() => {
      Message({ type: 'info', message: '已取消删除' })
    })
}

const multipleDelete = (multiData, deleteFun, callback) => {
  if (multiData.length === 0) {
    return Message.warning('请先选中至少一条数据')
  }
  let id = ''
  multiData.forEach(val => {
    id += val._id + ','
  })
  id = id.substring(0, id.length - 1)
  deleteById(id, deleteFun, callback)
}

export default {
  deleteById,
  multipleDelete
}

