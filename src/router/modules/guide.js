/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const guideRouter = {
  path: '/guide',
  component: Layout,
  redirect: '/guide/index',
  children: [{
      path: 'index',
      name: 'guide',
      component: () => import('@/views/guide/index'),
      meta: {
        title: '攻略管理',
        icon: 'guide',
        roles: ['admin']
      },
    },
    {
      path: 'add',
      component: () => import('@/views/guide/add'),
      name: 'addGuide',
      meta: {
        title: '新增攻略',
        icon: 'create',
        noCache: true,
        activeMenu: '/guide/index',
        roles: ['admin']
      },
      hidden: true
    },
    {
      path: 'edit/:id',
      component: () => import('@/views/guide/edit'),
      name: 'editGuide',
      meta: {
        title: '编辑攻略',
        noCache: true,
        activeMenu: '/guide/index',
        roles: ['admin']
      },
      hidden: true
    },
  ]
}
export default guideRouter
