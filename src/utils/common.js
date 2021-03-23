import {
  Message,
  MessageBox,
} from 'element-ui'

/**
 * 删除数据
 * @id {string} 多个id用 , 分隔
 * @deleteFun {Function} 删除数据调用的Api方法
 * @callback {Function} 删除成功的回调
 * @returns {null}
 */
export const deleteById = (id, deleteFun, callback) => {
  MessageBox.confirm('是否要永久删除该信息', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warn'
  })
    .then(() => {
      deleteFun(id).then(res => {
        Message.success(res.message)
        callback()
      })
    })
    .catch(() => {
      Message.info('已取消删除')
    })
}

export const multipleDelete = (multiData, deleteFun, callback) => {
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

export const uploadSuccess = (res) => {
  Message({ type: 'success', message: res.message || '上传成功' })
  const src = res.data.path
  return src.replace('/public', '')
}

export const uploadMultiSuccess = (files) => {
  // Message({ type: 'success', message: res.message || '上传成功' })
  let photoList = []
  files.forEach((pic, i) => {
    const src = pic.path.replace('/public', '')
    const uid = Date.parse(new Date()) / 1000 + i
    photoList.push({ name: pic.name, src, uid, status: 'success' })
  })
  return photoList
}

export const filterChange = (filters, target) => {
  Object.assign(target.queryInfo, filters)
  target.fetchData('new')
}

export const sortChange = (sortInfo, target) => {
  let order = sortInfo.order
  order === 'ascending' ? (order = 1) : (order = -1)
  target.queryInfo.sortJson = {}
  target.queryInfo.sortJson[sortInfo.prop] = order
  target.queryInfo.sort = JSON.stringify(target.queryInfo.sortJson)
  target.fetchData('new')
}

// 监听多选并给多选数组赋值
export const handleSelectionChange = (selection, target) => { 
  target.multipleSelection = 	selection
}

// 字符串首字母转大写，后面字母小写
/**
 * js字符串切割
 * @str {string}
*/
function firstToUpper(str) {
  return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase());
}

// 对象数组去重
/**
 * @key {string} 判断唯一值的键名
 * @returns {array} 去重后的数组
*/
export const unique = (arr, key) => {
  const res = new Map()
  return arr.filter(arr => !res.has(arr[key]) && res.set(arr[key], 1))
}

// 打开新增表格数据的表单弹窗
export const openAddForm = (name, target) => {
  target.dialogAddVisible = true
  // 用 this.nextTick 或者用个定时器来确保组件的 dom 渲染并更新
  target.$nextTick(function () {
    // 打开新增弹窗后重置表单 避免表单出现上一次新增的校验数据
    target.$refs[`new${firstToUpper(name)}Ref`].resetFields()
  })
}

// 关闭 新增/修改 表格数据的表单弹窗
export const dialogAddClose = (name, target) => {
  target.$refs[`new${firstToUpper(name)}Ref`].resetFields()
  delete target[`new${firstToUpper(name)}`]._id
  delete target[`new${firstToUpper(name)}`].__v
}

