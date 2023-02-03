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
    order: 1,
  },
  children: [
    {
      path: 'editor', // The midline path complies with SEO specifications
      name: 'Editor',
      component: () => import('@/views/three-editor/three-editor.vue'),
      meta: {
        locale: 'menu.three.editor',
        requiresAuth: true,
        roles: ['*'],
        keepAlive: false,
      },
    },
  ],
};

export default THREE;
