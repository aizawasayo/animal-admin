/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const archiveRouter = {
  path: '/archive',
  component: Layout,
  redirect: '/archive/furniture',
  name: 'Archive',
  meta: {
    title: '图鉴管理',
    icon: 'component',
    roles: ['admin']
  },
  children: [
    {
      path: 'furniture',
      component: () => import('@/views/archive/furniture'),
      name: 'Furniture',
      meta: {
        title: '家具',
        icon: 'fish',
        roles: ['admin']
      }
    },
    {
      path: 'clothing',
      component: () => import('@/views/archive/clothing'),
      name: 'Clothing',
      meta: {
        title: '服饰',
        icon: 'dress',
        roles: ['admin']
      }
    },
    {
      path: 'plant',
      component: () => import('@/views/archive/plant'),
      name: 'Plant',
      meta: {
        title: '植物',
        icon: 'plant',
        roles: ['admin']
      }
    },
    {
      path: 'material',
      component: () => import('@/views/archive/material'),
      name: 'Material',
      meta: {
        title: '素材',
        icon: 'shell',
        roles: ['admin']
      }
    },
    {
      path: 'tool',
      component: () => import('@/views/archive/tool'),
      name: 'Tool',
      meta: {
        title: '工具',
        icon: 'tool',
        roles: ['admin']
      }
    },
    {
      path: 'recipe',
      component: () => import('@/views/archive/recipe'),
      name: 'Recipe',
      meta: {
        title: 'DIY配方',
        icon: 'book',
        roles: ['admin']
      }
    },
    {
      path: 'record',
      component: () => import('@/views/archive/record'),
      name: 'Record',
      meta: {
        title: '唱片',
        icon: 'record',
        roles: ['admin']
      }
    }
  ]
}
export default archiveRouter
