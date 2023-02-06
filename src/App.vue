<template>
  <a-config-provider :locale="locale">
    <router-view :key="key"/>
    <global-setting />
  </a-config-provider>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import {useRouter, useRoute} from "vue-router";
  import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
  import GlobalSetting from '@/components/global-setting/index.vue';
  import useLocale from '@/hooks/locale';

  const { currentLocale } = useLocale();
  const locale = computed(() => {
    switch (currentLocale.value) {
      case 'zh-CN':
        return zhCN;
      case 'en-US':
        return enUS;
      default:
        return enUS;
    }
  });

  // 解决切换路由，页面不变的问题
  const route = useRoute();
  const key = computed(() => {
    console.log(route.path);
    return route.path + Math.random();
  });

</script>
