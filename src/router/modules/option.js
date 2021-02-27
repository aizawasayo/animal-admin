/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const optionRouter = {
  path: '/option',
  component: Layout,
  redirect: '/option/general',
  name: 'Option',
  meta: {
    title: '选项配置',
    icon: 'setting',
    roles: ['admin']
  },
  children: [{
      path: 'general',
      component: () => import('@/views/option/general'),
      name: 'GeneralSetting',
      meta: {
        title: '通用配置',
        icon: 'table',
        roles: ['admin']
      },
    },
    {
      path: 'islander',
      component: () => import('@/views/option/islander'),
      name: 'IslanderSetting',
      meta: {
        title: '岛民配置',
        icon: 'people',
        roles: ['admin']
      },
    },
    {
      path: 'furniture',
      component: () => import('@/views/option/furniture'),
      name: 'FurnitureSetting',
      meta: {
        title: '家具配置',
        icon: 'furniture',
        roles: ['admin']
      },
    },
    {
      path: 'clothing',
      component: () => import('@/views/option/clothing'),
      name: 'ClothingSetting',
      meta: {
        title: '服饰配置',
        icon: 'theme',
        roles: ['admin']
      }
    },
    {
      path: 'fish',
      component: () => import('@/views/option/fish'),
      name: 'FishSetting',
      meta: {
        title: '鱼类配置',
        icon: 'fish',
        roles: ['admin']
      }
    },
    {
      path: 'insect',
      component: () => import('@/views/option/insect'),
      name: 'InsectSetting',
      meta: {
        title: '昆虫配置',
        icon: 'bug',
        roles: ['admin']
      }
    },
    {
      path: 'halobios',
      component: () => import('@/views/option/halobios'),
      name: 'HalobiosSetting',
      meta: {
        title: '海洋生物配置',
        icon: 'sea',
        roles: ['admin']
      }
    },
    {
      path: 'tool',
      component: () => import('@/views/option/tool'),
      name: 'ToolSetting',
      meta: {
        title: '工具配置',
        icon: 'tool',
        roles: ['admin']
      }
    },
    {
      path: 'diy',
      component: () => import('@/views/option/diyOption'),
      name: 'DiySetting',
      meta: {
        title: 'DIY配置',
        icon: 'book',
        roles: ['admin']
      }
    },
  ]
}
export default optionRouter
