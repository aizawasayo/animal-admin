import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import archiveRouter from './modules/archive'
import museumRouter from './modules/museum'
import guideRouter from './modules/guide'
import optionRouter from './modules/option'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */


/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [{
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [{
      path: '/redirect/:path(.*)',
      component: () => import('@/views/redirect/index')
    }]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'home',
      component: () => import('@/views/dashboard/index'),
      meta: {
        title: '首页',
        icon: 'home'
      }
    }]
  },
  {
    path: '/community',
    component: Layout,
    redirect: '/community/turnip',
    name: 'community',
    meta: {
      title: '交流区',
      icon: 'example'
    },
    children: [{
        path: 'board',
        name: 'board',
        component: () => import('@/views/community/board'),
        meta: {
          title: '森友墙',
          icon: 'board'
        }
      }, {
        path: 'turnip',
        name: 'turnip',
        component: () => import('@/views/community/turnip'),
        meta: {
          title: '菜市场',
          icon: 'rutabaga'
        }
      },
      {
        path: 'trade',
        name: 'trade',
        component: () => import('@/views/community/trade'),
        meta: {
          title: '交易区',
          icon: 'exchange'
        }
      }
    ]
  },
  {
    path: '/design',
    component: Layout,
    children: [{
      path: 'index',
      name: 'design',
      component: () => import('@/views/design/index'),
      meta: {
        title: '服装图案管理',
        icon: 'dashboard',
      }
    }]
  },
  // {
  //   path: '/design',
  //   component: Layout,
  //   redirect: '/design/index',
  //   name: 'design',
  //   meta: {
  //     title: '服装图案管理',
  //     icon: 'dashboard'
  //   },
  //   children: [{
  //       path: 'hats',
  //       name: 'hats',
  //       component: () => import('@/views/tree/index'),
  //       meta: {
  //         title: '帽子',
  //         icon: 'hat'
  //       }
  //     },
  //     {
  //       path: 'clothes',
  //       name: 'clothes',
  //       component: () => import('@/views/tree/index'),
  //       meta: {
  //         title: '衣服',
  //         icon: 'theme'
  //       }
  //     },
  //     {
  //       path: 'pattern',
  //       name: 'pattern',
  //       component: () => import('@/views/tree/index'),
  //       meta: {
  //         title: '图案',
  //         icon: 'pattern'
  //       }
  //     }
  //   ]
  // },
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [{
    path: '/user',
    component: Layout,
    children: [{
      path: 'index',
      name: 'user',
      component: () => import('@/views/user/index'),
      meta: {
        title: '用户管理',
        icon: 'user',
        roles: ['admin']
      }
    }]
  },
  {
    path: '/islander',
    component: Layout,
    children: [{
      path: 'index',
      name: 'islander',
      component: () => import('@/views/archive/islander/index'),
      meta: {
        title: '岛民',
        icon: 'people',
        roles: ['admin']
      }
    }]
  },
  museumRouter,
  archiveRouter,
  guideRouter,
  optionRouter,
  // 404 page must be placed at the end !!!
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]


const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({
      y: 0
    }),
    routes: constantRoutes
  })

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
