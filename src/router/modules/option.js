/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const optionRouter = {
  path: '/option',
  component: Layout,
  redirect: '/option/general',
  name: 'option',
  meta: {
    title: '选项配置',
    icon: 'setting',
    roles: ['admin']
  },
  children: [{
      path: 'general',
      component: () => import('@/views/option/general/index'),
      name: 'general',
      meta: {
        title: '通用配置',
        icon: 'table',
        roles: ['admin']
      },
    },
    {
      path: 'furniture',
      component: () => import('@/views/option/furniture/index'),
      name: 'furnitureSetting',
      meta: {
        title: '家具配置',
        icon: 'furniture',
        roles: ['admin']
      },
    },
    {
      path: 'clothing',
      component: () => import('@/views/option/clothing/index'),
      name: 'clothingSetting',
      meta: {
        title: '服饰配置',
        icon: 'theme',
        roles: ['admin']
      }
    },
    {
      path: 'fish',
      component: () => import('@/views/option/fish/index'),
      name: 'fishSetting',
      meta: {
        title: '鱼类配置',
        icon: 'fish',
        roles: ['admin']
      }
    },
    {
      path: 'insect',
      component: () => import('@/views/option/insect/index'),
      name: 'insectSetting',
      meta: {
        title: '昆虫配置',
        icon: 'bug',
        roles: ['admin']
      }
    },
    {
      path: 'tool',
      component: () => import('@/views/option/tool/index'),
      name: 'toolSetting',
      meta: {
        title: '工具配置',
        icon: 'tool',
        roles: ['admin']
      }
    },
    {
      path: 'diy',
      component: () => import('@/views/option/diyOption/index'),
      name: 'diySetting',
      meta: {
        title: 'DIY配置',
        icon: 'book',
        roles: ['admin']
      }
    },
  ]
}
export default optionRouter
