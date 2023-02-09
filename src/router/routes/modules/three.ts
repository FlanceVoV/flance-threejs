import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const THREE: AppRouteRecordRaw = {
  path: '/three',
  name: 'Three',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.three',
    icon: 'icon-list',
    requiresAuth: true,
    order: -1
  },
  children: [
    {
      path: 'editor', // The midline path complies with SEO specifications
      name: 'Editor',
      component: () => import('@/views/three-editor/three-editor.vue'),
      meta: {
        locale: 'menu.three.editor',
        requiresAuth: true,
        roles: ['*']
      },
    },
    {
      path: 'editor2', // The midline path complies with SEO specifications
      name: 'Editor2',
      component: () => import('@/views/three-editor/three-editor-v2.vue'),
      meta: {
        locale: 'menu.three.editor2',
        requiresAuth: true,
        roles: ['*']
      },
    },
    {
      path: 'list', // The midline path complies with SEO specifications
      name: 'List',
      component: () => import('@/views/three-editor/three-list.vue'),
      meta: {
        locale: 'menu.three.list',
        requiresAuth: true,
        roles: ['*']
      },
    },
  ],
};

export default THREE;
