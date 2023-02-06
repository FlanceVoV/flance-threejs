<template>
  <div>
    <div class="container" style="width: 100%; height: 100%">
      <div id="header">
        <a-page-header>
          <template #extra>
            <div>
              {{ testName }}
            </div>
            <button @click="parse3d"> 3d鼠标</button>

            <button @click="parse2d"> 2d鼠标</button>

            <button @click="cylinder"> 圆柱体鼠标</button>

            <button @click="onLineClick"> 鼠标跟随</button>

            <button @click="createMouse"> 生成鼠标模型</button>

            <button @click="outline"> 选择变色</button>

            <button @click="clearOutline"> 取消变色</button>

            <button @click="initTransformControl"> 拖拽</button>

            <button> 背景</button>

            <button> 材质</button>

            <button> 贴图</button>

            <button> 光照</button>

            <br />

            <button @click="viewToModel"> 摄像头</button>

            <button @click="undo"> 撤回</button>

            <button @click="redo"> 恢复</button>

            <button> 打开素材库</button>

            <button @click="loadGltf"> 导入gltf</button>

            <button> 导出gltf</button>

            <button> 保存为素材</button>

            <button @click="newScene"> 打开新视图</button>

            <button @click="clearChoose"> 清除选中</button>

            <button @click="clearModel"> 清空模型</button>
          </template>
        </a-page-header>
      </div>
      <div
        id="content"
        style="
        position: absolute;
        width: calc(100% - 230px);
        height: calc(100% - 230px);
      "
        @contextmenu="void 0"
      >
      </div>
    </div>
    <!-- 打开新视图 -->
    <new-scene-window></new-scene-window>
  </div>
</template>

<script lang="ts">
import { ref, reactive, toRefs, computed } from "vue";
import { Scene } from "@/components/threejs/scene";
import { SceneApi } from "@/components/threejs/scene.api";
import {
  THREE,
  TransformControls,
  GLTFLoader
} from "@/components/threejs/three";
import glb from "@/static/LittlestTokyo.glb";
// import gltf from '@/static/scene.gltf';
import gltf from "@/static/test.glb";
import NewSceneWindow from "@/components/threejs/scene.window.vue";
import { DragControls } from "three/examples/jsm/controls/DragControls";

let scene: Scene;

let sceneApi: SceneApi;

let renders: any;

let transformControls: any;

let dragControls: any;

let container: any;

let holdShift = false;

let holdCtrl = false;

let holdAlt = false;

let isEditor = false;

let model = "2d";

const objects: any = [];

const undoObjects: any = [];

const selectedObjects: any = [];

let currentSelect: any;

let currentSelectHelper: any;

const side: any = [];

export default {
  name: "Editor",
  components: { NewSceneWindow },
  data() {
    return {
      testName: "测试名称"
    };
  },
  mounted() {
    // this as any typescript 根据词法作用域检测methods，直接this.xxx编辑器会提示错误，但并不影响编译运行。此处使用this as any来避免编辑器提示
    let that = this as any;

    container = document.getElementById("content");

    // 创建场景 3d 封装
    scene = new Scene("#content");
    scene.renderer.domElement.style.outline = "none";
    scene.container.appendChild(scene.renderer.domElement);

    sceneApi = new SceneApi(scene);

    // 屏幕适应监听
    window.addEventListener("resize", that.onWindowResize, false);
    // shift down
    document.addEventListener("keydown", that.onDocumentKeyDown, false);
    // shift up
    document.addEventListener("keyup", that.onDocumentKeyUp);

    // 生成基础界面
    sceneApi.initDefaultSceneView(scene, objects);

    // // 画网格
    // scene.drawGridHelper();
    //
    // // 中心
    // scene.drawCenter();
    //
    // // 添加地面
    // objects.push(scene.plane);
    //
    // // scene.addSubScene('footer');
    //
    // // 逐帧绘制 回调
    // that.animate();
  },

  methods: {
    onWindowResize() {
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
        case 18:
          holdAlt = true;
          break;
        case 32:
          scene.container.removeEventListener(
            "pointermove",
            this.onPointerMove,
            false
          );
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
        case 18:
          holdAlt = false;
          break;
        case 32:
          scene.container.addEventListener(
            "pointermove",
            this.onPointerMove,
            false
          );
          break;
        default:
          break;
      }
    },

    parse3d() {
      if (model === "2d") {
        model = "3d";
        sceneApi.create3dMouseDefault();
      }
    },

    parse2d() {
      if (model === "3d") {
        model = "2d";
        sceneApi.create2dMouse();
      }
    },

    cylinder() {
      let geo = new THREE.CylinderGeometry(25, 25, 25, 25, 25, false);
      let material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true
      });
      let mesh = new THREE.Mesh(geo, material);
      sceneApi.create3dMouseByModel(geo, material, mesh);
    },

    onLineClick() {
      this.transformControlsRemove();
      if (!isEditor) {
        scene.container.addEventListener(
          "pointermove",
          this.onPointerMove,
          false
        );
        scene.container.addEventListener("click", this.onPointerClick, false);

        // 重置相机位置
        scene.camera.position.set(0, 1100, 0);
        scene.camera.lookAt(0, 0, 0);

        // 关闭场景移动
        scene.controls.enabled = false;
      }
    },

    createMouse(event: any) {
      // 2d
      let raycaster = sceneApi.create2dRay(event, container);
      const intersects = raycaster.intersectObjects(objects);
      if (intersects.length > 0) {
        const intersect: any = intersects[0];
        objects.push(sceneApi.mouseClickCreateByMouse(intersect));
      }
    },

    // 选择模型
    chooseModel(event: any) {
      let that = this as any;
      let hasSelect = sceneApi.chooseOneModel(
        event,
        container,
        selectedObjects
      );
      if (hasSelect) {
        currentSelect = hasSelect;
        that.testName = currentSelect.name;
      }
    },

    viewToModel(event: any) {
      sceneApi.viewToModel(currentSelect);
    },

    // 清空选择
    clearChoose() {
      sceneApi.clearChooseModels(selectedObjects);
    },

    outline() {
      sceneApi.outColor(selectedObjects);
    },

    clearOutline() {
      sceneApi.clearOutColor(selectedObjects);
    },

    onPointerClick(event: any) {
      // 2d
      let raycaster = sceneApi.create2dRay(event, container);
      const intersects = raycaster.intersectObjects(objects);

      // 移除模型控制
      if (intersects.length > 0) {
        const intersect: any = intersects[0];
        /*
          左键 event.button = 0
          中键 event.button = 1
          右键 event.button = 2
       */
        if (event.button === 0) {
          if (holdAlt) {
            sceneApi.moveObjectWithMouse(selectedObjects);
            return;
          }
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
              sceneApi.removeOne(intersect);
              objects.splice(objects.indexOf(intersect.object), 1);
            }
          } else {
            objects.push(sceneApi.mouseClickCreateCube(intersect));
          }
        }
      }
    },

    onPointerMove(event: any) {
      sceneApi.mouseMoveWithRedMesh(event, container, objects);
    },

    // 撤回
    undo() {
      sceneApi.undoWithCacheArray(objects, undoObjects);
    },

    // 恢复
    redo() {
      sceneApi.redoWithCacheArray(objects, undoObjects);
    },

    loadGltf() {
      scene.loadGltf(gltf);
      scene.render();
    },

    initTransformControl() {
      scene.container.removeEventListener(
        "click",
        this.onPointerClick,
        false
      );
      transformControls = new TransformControls(
        scene.camera,
        scene.renderer.domElement
      );
      transformControls.name = "transformControls";

      // 初始化拖拽控件
      let dragControls = new DragControls(
        objects,
        scene.camera,
        scene.renderer.domElement
      );

      // 鼠标略过事件
      dragControls.addEventListener("hoveron", function(event) {
        if (event.name === "mouseCtrl") {
          return;
        }
        console.log(event);
        // 让变换控件对象和选中的对象绑定
        transformControls.attach(event.object);
        sceneApi.outColor([
          { key: event.object.uuid, helper: null, intersect: event }
        ]);
      });

      // 鼠标移除事件
      dragControls.addEventListener("hoveroff", function(event) {
        sceneApi.clearOutColor([
          { key: event.object.uuid, helper: null, intersect: event }
        ]);
      });
      // 开始拖拽
      dragControls.addEventListener("dragstart", function(event) {
        if (event.name === "mouseCtrl") {
          return;
        }
        console.log("c");
      });
      // 拖拽结束
      dragControls.addEventListener("dragend", function(event) {
        console.log("e");
      });

      scene.scene.add(transformControls);
    },

    transformControlsRemove() {
      if (transformControls) {
        transformControls.detach();
      }
      if (dragControls) {
        dragControls.remove();
        dragControls.dipose();
      }
      transformControls = null;
      let allChildren = scene.scene.children;
      for (let i = 0; i < allChildren.length; i += 1) {
        if (allChildren[i].name === "transformControls") {
          scene.scene.remove(allChildren[i]);
        }
      }
    },

    newScene() {
      NewSceneWindow.methods?.init(scene, objects, "视图");
    },

    animate() {
      // 请求再次执行渲染函数render
      renders = requestAnimationFrame(this.animate);
      // 执行渲染操作
      scene.renderer.render(scene.scene, scene.camera);
    },

    clearModel() {
      // 删除模型
      sceneApi.clearModelWithName(
        ["Plane", "axesHelper", "mouseCtrl", "gridHelper", "pointLight"],
        []
      );
      objects.splice(1);

      // 移除事件
      scene.container.removeEventListener(
        "pointermove",
        this.onPointerMove,
        false
      );
      scene.container.removeEventListener(
        "click",
        this.onPointerClick,
        false
      );

      isEditor = false;
    },

    // 删除模型
    initDispose() {
      let that = this as any;
      if (scene.scene) {
        sceneApi.clearModelWithName([], []);
        scene.scene.remove();
        scene.renderer.dispose();
        scene.renderer.forceContextLoss();
        cancelAnimationFrame(renders);
      }
    },

    destroyed() {
      this.initDispose();
    }
  }
};
</script>
