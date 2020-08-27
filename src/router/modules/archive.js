/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const archiveRouter = {
  path: '/archive',
  component: Layout,
  redirect: '/archive/furniture',
  name: 'archive',
  meta: {
    title: '图鉴管理',
    icon: 'component',
    roles: ['admin']
  },
  children: [{
      path: 'furniture',
      component: () => import('@/views/archive/furniture/index'),
      name: 'furniture',
      meta: {
        title: '家具',
        icon: 'fish',
        roles: ['admin']
      }
    },
    {
      path: 'clothing',
      component: () => import('@/views/archive/clothing/index'),
      name: 'clothing',
      meta: {
        title: '服饰',
        icon: 'dress',
        roles: ['admin']
      }
    },
    {
      path: 'plant',
      component: () => import('@/views/archive/plant/index'),
      name: 'plant',
      meta: {
        title: '植物',
        icon: 'plant',
        roles: ['admin']
      }
    },
    {
      path: 'material',
      component: () => import('@/views/archive/material/index'),
      name: 'material',
      meta: {
        title: '素材',
        icon: 'shell',
        roles: ['admin']
      }
    },
    {
      path: 'tool',
      component: () => import('@/views/archive/tool/index'),
      name: 'tool',
      meta: {
        title: '工具',
        icon: 'tool',
        roles: ['admin']
      }
    },
    {
      path: 'recipe',
      component: () => import('@/views/archive/recipe/index'),
      name: 'recipe',
      meta: {
        title: 'DIY配方',
        icon: 'book',
        roles: ['admin']
      }
    },
    {
      path: 'record',
      component: () => import('@/views/archive/record/index'),
      name: 'record',
      meta: {
        title: '唱片',
        icon: 'record',
        roles: ['admin']
      }
    },
  ]
}
export default archiveRouter
