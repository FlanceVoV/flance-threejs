<template>
  <div
    id="newScene"
    style="position: fixed; display: none; width: 220px; height: 220px"
  >
    <div style="width: 220px">
      {{ name }}{{ type }}
      <button @click="close" style="text-align: right">关闭窗口</button>
      <button>拉近</button>
      <button>远离</button>
      <button>升高</button>
      <button>降低</button>
      <button>左移</button>
      <button>右移</button>
      <button>贴近模型</button>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import { Scene } from '@/components/threejs/scene';
  import { SceneApi } from '@/components/threejs/scene.api';
  import { THREE } from '@/components/threejs/three';

  let holdMouse = false;

  let scene: Scene;

  let scenes: Array<{
    scene: Scene;
    sceneApi: SceneApi;
  }> = [];

  let sceneApi: SceneApi;

  let objects: any = [];

  // 同步渲染
  let isMain = false;

  export default defineComponent({
    name: 'newSceneWindow',
    data() {
      return {
        name: '新场景',
        type: 'top',
        carma: null,
      };
    },
    props: {},
    components: {},
    setup(props, ctx) {
      return {};
    },
    mounted() {
      let newWindow = document.getElementById('newScene');
      if (newWindow) {
        newWindow.addEventListener('mousedown', this.onmousedown);
        newWindow.addEventListener('mouseup', this.onmouseup);
      }
    },
    methods: {
      init(creatorScene: THREE.Scene, objs: Array<any>, name: string) {
        let newWindow = document.getElementById('newScene');
        if (newWindow) {
          newWindow.style.display = 'inline-block';
        }
        this.name = name;
        objects = objs;

        if (creatorScene) {
          scene = new Scene('#newScene', creatorScene);
          scene.renderer.setAnimationLoop(() => scene.render());
          isMain = true;
        } else {
          isMain = false;
          scene = new Scene('#newScene');
          sceneApi.initDefaultSceneView(scene, objects);
        }

        // 禁止控制摄像头
        scene.controls.enabled = false;

        this.switchCamera('top');

        sceneApi = new SceneApi(scene);
        scenes.push({ scene: scene, sceneApi: sceneApi });
      },
      onmousedown(event: any) {
        holdMouse = true;
        let newWindow = document.getElementById('newScene');
        if (newWindow) {
          newWindow.addEventListener('pointermove', this.pointermove);
        }
      },
      onmouseup(event: any) {
        holdMouse = false;
        let newWindow = document.getElementById('newScene');
        if (newWindow) {
          newWindow.removeEventListener('pointermove', this.pointermove);
        }
      },
      pointermove(event: any) {
        if (holdMouse) {
          // 元素大小
          let elW = event.currentTarget.offsetWidth;
          let elH = event.currentTarget.offsetHeight;
          // 窗口大小
          let w = window.innerWidth;
          let h = window.innerHeight;

          // 当前元素
          let el = event.currentTarget;
          el.style.right = w - event.clientX - elW / 2 + 'px';
          el.style.bottom = h - event.clientY - elH / 2 + 'px';
        }
      },

      close(event: any) {
        scenes.forEach((item) => {
          if (!isMain) {
            item.sceneApi.clearModelWithName([], []);
            item.scene.scene.clear();
            item.scene.scene.remove();
          }

          item.scene.renderer.domElement.remove();
          let newWindow = document.getElementById('newScene');
          if (newWindow) {
            newWindow.style.display = 'none';
          }
        });
      },

      switchCamera(type: string) {
        switch (type) {
          case 'left':
            // 左部视角
            scene.camera.lookAt(0, 0, 0);
            scene.camera.position.set(0, 1000, 0);
            break;
          case 'top':
            // 顶部视角
            scene.camera.lookAt(0, 0, 0);
            scene.camera.position.set(0, 300, 0);
            break;
          case 'right':
            break;
          default:
            break;
        }
      },
    },
  });
</script>
