<template>
  <div class="container" style="width: 100%; height: 100%">
    <div id="header">
      <a-page-header>
        <template #extra>
          <ChildComponent v-model:name="selectedName">
            {{ name }}
          </ChildComponent>
          <button @click="parse3d"> 3d </button>

          <button @click="parse2d"> 2d </button>

          <button @click="onLineClick"> 画线 </button>

          <button> 生成 </button>

          <button> 背景 </button>

          <button> 材质 </button>

          <button> 贴图 </button>

          <button @click="undo"> 撤回 </button>

          <button @click="redo"> 恢复 </button>

          <button> 打开素材库 </button>

          <button @click="loadGltf"> 导入gltf </button>

          <button> 导出gltf </button>

          <button> 保存为素材 </button>

          <button @click="clearModel"> 清空 </button>
        </template>
      </a-page-header>
    </div>
    <div
      id="content"
      style="
        position: absolute;
        width: calc(100% - 10px);
        height: calc(100% - 10px);
      "
      @contextmenu="void 0"
    >
    </div>
  </div>
</template>

<script lang="ts">
  import { ref, reactive, toRefs, computed } from 'vue';
  import { Scene } from '@/components/threejs/scene';
  import {
    THREE,
    TransformControls,
    GLTFLoader,
  } from '@/components/threejs/three';
  import glb from '@/static/LittlestTokyo.glb';
  import gltf from '@/static/scene.gltf';

  let scene: Scene;

  let renders: any;

  let transformControls: any;

  let container: any;

  let holdShift = false;

  let holdCtrl = false;

  let isEditor = false;

  let model = '2d';

  let mousePoint = new Array<THREE.Vector3>();

  const objects: any = [];

  const undoObjects: any = [];

  const selectedObjects: any = [];

  let currentSelect: any;

  const side: any = [];

  let selectedName = '未选择';

  export default {
    mounted() {
      // this as any typescript 根据词法作用域检测methods，直接this.xxx编辑器会提示错误，但并不影响编译运行。此处使用this as any来避免编辑器提示
      let that = this as any;

      container = document.getElementById('content');

      // 创建场景 3d 封装
      scene = new Scene('#content');
      scene.renderer.domElement.style.outline = 'none';
      scene.container.appendChild(scene.renderer.domElement);

      // 屏幕适应监听
      window.addEventListener('resize', that.onWindowResize, false);
      // shift down
      document.addEventListener('keydown', that.onDocumentKeyDown, false);
      // shift up
      document.addEventListener('keyup', that.onDocumentKeyUp);

      // 画网格
      scene.drawGridHelper();

      // 中心
      scene.drawCenter();

      // 添加地面
      objects.push(scene.plane);

      // scene.addSubScene('footer');

      // 逐帧绘制 回调
      that.animate();
    },

    methods: {
      onWindowResize() {
        console.log(container.clientWidth);
        scene.camera.aspect = container.clientWidth / container.clientHeight;
        scene.camera.updateProjectionMatrix();
        scene.renderer.setSize(container.clientWidth, container.clientHeight);
      },

      onDocumentKeyDown(event: any) {
        switch (event.keyCode) {
          case 16:
            holdShift = true;
            scene.controls.enabled = true;
            break;
          case 17:
            holdCtrl = true;
            scene.controls.enabled = false;
            break;
          default:
            break;
        }
      },

      onDocumentKeyUp(event: any) {
        switch (event.keyCode) {
          case 16:
            holdShift = false;
            scene.controls.enabled = false;
            break;
          case 17:
            holdCtrl = false;
            scene.controls.enabled = false;
            break;
          default:
            break;
        }
      },

      parse3d(event: any) {
        if (model === '2d') {
          model = '3d';
        }
      },

      parse2d(event: any) {
        if (model === '3d') {
          model = '2d';
        }
      },

      onMouseDown(event: any) {
        mousePoint = [];
        let getBoundingClientRect = container.getBoundingClientRect();
        let offsetWidth =
          ((event.clientX - getBoundingClientRect.left) /
            container.offsetWidth) *
            2 -
          1;
        let offsetHeight =
          -(
            (event.clientY - getBoundingClientRect.top) /
            container.offsetHeight
          ) *
            2 +
          1;
        console.log(offsetWidth);
        console.log(offsetHeight);
        mousePoint.push(Scene.parseLine(offsetWidth, 0, offsetHeight));
      },

      onMouseUp(event: any) {
        let getBoundingClientRect = container.getBoundingClientRect();
        let offsetWidth =
          ((event.clientX - getBoundingClientRect.left) /
            container.offsetWidth) *
            2 -
          1;
        let offsetHeight =
          -(
            (event.clientY - getBoundingClientRect.top) /
            container.offsetHeight
          ) *
            2 +
          1;
        console.log(offsetWidth);
        console.log(offsetHeight);
        mousePoint.push(Scene.parseLine(offsetWidth, 0, offsetHeight));
        scene.drawLine(mousePoint);
      },

      onLineClick() {
        if (!isEditor) {
          scene.container.addEventListener(
            'pointermove',
            this.onPointerMove,
            false
          );
          scene.container.addEventListener('click', this.onPointerClick, false);

          // 重置相机位置
          scene.camera.position.set(0, 1100, 0);
          scene.camera.lookAt(0, 0, 0);

          // 关闭场景移动
          scene.controls.enabled = false;
        }
      },

      // 选择模型
      chooseModel(event: any) {
        // ray因为屏幕有侧边栏，位置偏移问题
        let getBoundingClientRect = scene.container.getBoundingClientRect();
        // 2d
        let x =
          ((event.clientX - getBoundingClientRect.left) /
            container.offsetWidth) *
            2 -
          1;
        let y =
          -(
            (event.clientY - getBoundingClientRect.top) /
            container.offsetHeight
          ) *
            2 +
          1;

        // 标准设备坐标
        let standardVector = new THREE.Vector3(x, y, 0.5);
        let worldVector = standardVector.unproject(scene.camera);
        let ray = worldVector.sub(scene.camera.position).normalize();
        let rayCaster = new THREE.Raycaster(scene.camera.position, ray);
        const intersects = rayCaster.intersectObjects(
          scene.scene.children,
          true
        );

        if (intersects.length > 0) {
          const intersect: any = intersects[0];

          // 反选
          for (let i = selectedObjects.length - 1; i >= 0; i -= 1) {
            if (selectedObjects[i].key === intersect.object.uuid) {
              selectedObjects[i].helper.dispose();
              selectedObjects[i].helper.remove();
              scene.scene.remove(selectedObjects[i].helper);
              selectedObjects.splice(i, 1);
              return;
            }
          }

          if (
            !(intersect.object instanceof THREE.BoxHelper) &&
            intersect.object !== scene.plane &&
            intersect.object !== scene.mouseMesh &&
            intersect.object !== scene.axesHelper
          ) {
            let helper = new THREE.BoxHelper(intersect.object, 'blue');
            scene.scene.add(helper);
            selectedObjects.push({
              key: intersect.object.uuid,
              helper,
            });
            currentSelect = intersect.object;
            selectedName = intersect.object.name;
            scene.render();
          }
        }
      },

      onPointerClick(event: any) {
        // ray因为屏幕有侧边栏，位置偏移问题
        let getBoundingClientRect = scene.container.getBoundingClientRect();
        // 2d
        let x =
          ((event.clientX - getBoundingClientRect.left) /
            container.offsetWidth) *
            2 -
          1;
        let y =
          -(
            (event.clientY - getBoundingClientRect.top) /
            container.offsetHeight
          ) *
            2 +
          1;

        scene.pointer.set(x, y);
        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(scene.pointer, scene.camera);
        const intersects = raycaster.intersectObjects(objects);

        // 移除模型控制
        this.transformControlsRemove();
        if (intersects.length > 0) {
          const intersect: any = intersects[0];
          console.log(intersect);
          /*
        左键 event.button = 0
        中键 event.button = 1
        右键 event.button = 2
         */
          if (event.button === 0) {
            if (holdCtrl) {
              this.chooseModel(event);
              return;
            }
            // 按住shift时，如果点击的是地面，则正常操作场景
            if (holdShift) {
              if (
                intersect.object !== scene.plane &&
                intersect.object !== scene.mouseMesh
              ) {
                scene.scene.remove(intersect.object);
                objects.splice(objects.indexOf(intersect.object), 1);
              }
            } else {
              // 鼠标点击位置 添加模型
              let cube = new THREE.Mesh(
                new THREE.BoxGeometry(100, 100, 100),
                new THREE.MeshBasicMaterial({
                  color: 0xff0000,
                })
              );
              cube.name = 'myCube';
              cube.position.set(
                intersect.point.x,
                intersect.point.y,
                intersect.point.z
              );
              scene.scene.add(cube);
              scene.render();
            }
          }
        }
      },

      onPointerMove(event: any) {
        // ray因为屏幕有侧边栏，位置偏移问题
        let getBoundingClientRect = container.getBoundingClientRect();
        // 二维坐标
        let x =
          ((event.clientX - getBoundingClientRect.left) /
            container.offsetWidth) *
            2 -
          1;
        let y =
          -(
            (event.clientY - getBoundingClientRect.top) /
            container.offsetHeight
          ) *
            2 +
          1;
        scene.pointer.set(x, y);

        let raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(scene.pointer, scene.camera);
        const intersects = raycaster.intersectObjects(objects);

        if (intersects.length > 0) {
          const intersect: any = intersects[0];
          if (intersect) {
            scene.mouseMesh.position
              .copy(intersect.point)
              .add(intersect.face.normal);
            scene.mouseMesh.position
              .divideScalar(25)
              .floor()
              .multiplyScalar(25)
              .addScalar(12.5);
            scene.mouseMesh.position.y = 0;
          }
        }

        scene.render();
      },

      // 撤回
      undo(event: any) {
        if (objects.length > 1) {
          let undo = objects[objects.length - 1];
          undoObjects.push(undo);

          if (undo.dispose) {
            undo.dispose();
          }

          if (undo.remove) {
            undo.remove();
          }
          scene.scene.remove(undo);
          objects.length -= 1;
          scene.render();
        }
      },

      // 恢复
      redo(event: any) {
        if (undoObjects.length > 0) {
          let redo = undoObjects[undoObjects.length - 1];
          scene.scene.add(redo);
          objects.push(redo);
          scene.render();
          undoObjects.length -= 1;
        }
      },

      loadGltf() {
        scene.loadGltf(gltf);
        scene.render();
      },

      initTransformControl() {
        transformControls = new TransformControls(
          scene.camera,
          scene.renderer.domElement
        );
        transformControls.name = 'transformControls';
        scene.scene.add(transformControls);
      },

      transformControlsRemove() {
        if (transformControls) {
          transformControls.detach();
        }
        transformControls = null;
        let allChildren = scene.scene.children;
        for (let i = 0; i < allChildren.length; i += 1) {
          if (allChildren[i].name === 'transformControls') {
            scene.scene.remove(allChildren[i]);
          }
        }
      },

      animate() {
        // 请求再次执行渲染函数render
        renders = requestAnimationFrame(this.animate);
        // 执行渲染操作
        scene.renderer.render(scene.scene, scene.camera);
      },

      clearModel() {
        let allChildren = scene.scene.children;
        for (let i = allChildren.length - 1; i >= 0; i -= 1) {
          // 清空线
          if (
            allChildren[i] instanceof THREE.Line &&
            allChildren[i].name === Scene.LINE_NAME
          ) {
            scene.scene.remove(allChildren[i]);
          }
        }

        objects.splice(1);

        // 重置相机位置
        scene.camera.position.set(0, 1100, 0);
        scene.camera.lookAt(0, 0, 0);

        // 回中
        scene.mouseMesh.position.x = 0;
        scene.mouseMesh.position.y = 0;
        scene.mouseMesh.position.z = 0;

        // 移除事件
        scene.container.removeEventListener(
          'pointermove',
          this.onPointerMove,
          false
        );
        scene.container.removeEventListener(
          'click',
          this.onPointerClick,
          false
        );

        isEditor = false;
      },

      // 删除模型
      initDispose() {
        let that = this as any;
        if (scene.scene) {
          let allChildren = scene.scene.children.filter((x) => x);
          allChildren.forEach((a) => {
            that.dispose(scene.scene, a);
          });
          scene.scene.remove();
          scene.renderer.dispose();
          scene.renderer.forceContextLoss();
          cancelAnimationFrame(renders);
        }
      },

      dispose(parent: any, child: any) {
        if (child.children.length) {
          let arr = child.children.filter((x: any) => x);
          arr.forEach((obj: any) => {
            this.dispose(child, obj);
          });
        }
        if (child.type === 'Mesh' || child.type === 'Line') {
          if (child.material.map) {
            if (child.material.map.dispose) {
              child.material.map.dispose();
            }
          }
          if (child.material.dispose) {
            child.material.dispose();
          }
          if (child.geometry.dispose) {
            child.geometry.dispose();
          }
        } else if (child.material) {
          if (child.material.dispose) {
            child.material.dispose();
          }
        }
        child.remove();
        parent.remove(child);
      },
      destroyed() {
        this.initDispose();
      },
    },
  };
</script>
