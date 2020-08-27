/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const museumRouter = {
  path: '/museum',
  component: Layout,
  redirect: '/museum/fish',
  name: 'museum',
  meta: {
    title: '博物馆图鉴',
    icon: 'museum',
    roles: ['admin']
  },
  children: [
    {
      path: 'fish',
      component: () => import('@/views/museum/fish/index'),
      name: 'fish',
      meta: {
        title: '鱼类',
        icon: 'fish',
        roles: ['admin']
      }
    },
    {
      path: 'insect',
      component: () => import('@/views/museum/insect/index'),
      name: 'insect',
      meta: {
        title: '昆虫',
        icon: 'bug',
        roles: ['admin']
      }
    },
    {
      path: 'fossil',
      component: () => import('@/views/museum/fossil/index'),
      name: 'fossil',
      meta: {
        title: '化石',
        icon: 'dragon',
        roles: ['admin']
      }
    },
    {
      path: 'artwork',
      component: () => import('@/views/museum/artwork/index'),
      name: 'artwork',
      meta: {
        title: '艺术品',
        icon: 'art',
        roles: ['admin']
      }
    },
    {
      path: 'halobios',
      component: () => import('@/views/museum/halobios/index'),
      name: 'halobios',
      meta: {
        title: '海洋生物',
        icon: 'sea',
        roles: ['admin']
      }
    }
  ]
}
export default museumRouter
