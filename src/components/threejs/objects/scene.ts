import { THREE } from "@/components/threejs/three";
import { generateUUID } from "three/src/math/MathUtils";
import { SceneRender } from "@/components/threejs/objects/scene.render";
import { SceneCamera } from "@/components/threejs/objects/scene.camera";
import { Object3D } from "three";

/**
 * 场景模型封装
 * @author jhf
 */
export class Scene {

  /**
   * 场景id
   */
  id: string;

  /**
   * 场景名称
   */
  name: string;

  /**
   * 场景实例
   */
  scene: THREE.Scene;

  /**
   * 地面实例
   */
  plane: THREE.Mesh | undefined;

  /**
   * 地面网格实例
   */
  gridHelper: THREE.GridHelper | undefined;

  /**
   * 场景大小
   */
  size: number = 10000;

  /**
   * 场景分割份数
   */
  divisions: number = 400;

  /**
   * 场景渲染dom
   */
  containers: Array<Element> = [];

  /**
   * 场景渲染dom selector
   */
  selectors: Array<string> = [];

  /**
   * 场景渲染器
   */
  renders: Array<{
    id: string,
    name: string,
    render: SceneRender
  }> = [];

  /**
   * 场景中的所有模型实例
   */
  objects: Array<Object3D> = [];

  /**
   * 场景摄像机
   */
  cameras: Array<{
    id: string,
    name: string,
    render: SceneRender,
    container: HTMLElement,
    camera: SceneCamera
  }> = [];

  constructor(name: string, selectors: Array<string>);
  constructor(name: string, selectors: Array<string>, id: string);
  constructor(name: string, selectors: Array<string>, id?: string) {

    this.name = name;

    if (id) {
      this.id = id;
    } else {
      this.id = generateUUID();
    }

    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.name = this.name + ".scene";

    // 绑定渲染dom
    this.selectors = selectors;

    // 初始化场景
    this.init();
  }

  /**
   * 场景初始化
   */
  init() {
    this.scene.background = new THREE.Color(0xffffff);
    this.createContainer(this.selectors);
    this.createRender();
    this.createPlane();
    this.createCamera();
  }

  /**
   * 初始化渲染容器
   * @param selectors
   */
  createContainer(selectors: Array<string>) {
    this.selectors = selectors;
    this.containers = [];
    this.selectors.forEach(selector => {
      let container = document.querySelector(selector);
      if (container) {
        this.containers.push(container);
      }
    });
  }

  /**
   * 创建渲染器
   */
  createRender() {
    this.clearRenders();
    this.containers.forEach((container, index) => {
      this.addRenderByContainer(container);
    });
  }

  /**
   * 添加渲染器
   * @param container   dom
   */
  addRenderByContainer(container: Element): string {
    let sceneRender = new SceneRender(this.name + ".render." + this.renders.length, this, container);
    this.renders.push({ id: sceneRender.id, name: sceneRender.name, render: sceneRender });
    return sceneRender.id;
  }

  /**
   * 添加渲染器
   * @param selector  dom str
   */
  addRender(selector: string): string {
    let container = document.querySelector(selector);
    if (!container) {
      throw new Error("找不到元素[" + selector + "]");
    }
    let sceneRender = new SceneRender(this.name + ".render." + this.renders.length, this, container);
    this.renders.push({ id: sceneRender.id, name: sceneRender.name, render: sceneRender });
    return sceneRender.id;
  }

  /**
   * 添加摄像机
   * @param render      渲染器
   * @param name        相机名称
   * @param fov         摄像机视锥体垂直视野角度
   * @param near        摄像机视锥体近端面
   * @param far         摄像机视锥体远端面
   */
  addCamera(render: SceneRender, name: string, fov: number, near: number, far: number): string {
    let sceneCamera = new SceneCamera(name, fov, near, far, render);
    this.cameras.push({
      id: sceneCamera.id,
      name: sceneCamera.name,
      render: render,
      container: render.renderer.domElement,
      camera: sceneCamera
    });
    return sceneCamera.id;
  }

  /**
   * 创建摄像机
   */
  createCamera() {
    this.clearCameras();
    this.renders.forEach((render, index) => {
      let name = this.name + ".camera." + index;
      this.addCamera(render.render, name, 50, 1, 50000);
    });
  }

  /**
   * 创建地面
   * @param geometry    地面几何
   * @param material    地面材质
   * @param gridHelper  网格
   */
  createPlane(geometry?: THREE.PlaneGeometry, material?: THREE.MeshBasicMaterial, gridHelper?: THREE.GridHelper) {

    let planeGeometry = geometry;
    if (!planeGeometry) {
      planeGeometry = new THREE.PlaneGeometry(this.size, this.size);
      planeGeometry.rotateX(-Math.PI / 2);
    }

    let planeMaterial = material;
    if (!planeMaterial) {
      planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
    }

    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.name = this.name + ".plane";
    this.plane.receiveShadow = true;

    if (!gridHelper) {
      this.gridHelper = new THREE.GridHelper(this.size, this.divisions);
      this.gridHelper.name = this.name + ".gridHelper";
      this.scene.add(this.gridHelper);
    }

    this.scene.add(this.plane);
    this.objects.push(this.plane);
  }

  /**
   * 清空渲染器 释放内存
   */
  clearRenders() {
    if (this.renders.length > 0) {
      this.renders.forEach(render => {
        render.render.destroy();
      });
      this.renders = [];
    }
  }

  /**
   * 清空摄像机
   */
  clearCameras() {
    if (this.cameras.length > 0) {
      this.cameras.forEach((camera, index) => {
        camera.camera.destroy();
      });
    }
    this.cameras = [];
  }

  /**
   * 根据id获取摄像机
   * @param cameraId  摄像机id
   */
  getCameraById(cameraId: string): THREE.PerspectiveCamera {
    if (this.cameras.length == 0) {
      throw new Error("摄像头未初始化");
    }
    this.cameras.forEach((camera, index) => {
      if (camera.id === cameraId) {
        return camera.camera;
      }
    });
    throw new Error("找不到摄像头[" + cameraId + "]");
  }

  /**
   * 获取默认的摄像机，第0个
   */
  getDefaultCamera(): THREE.PerspectiveCamera {
    if (this.cameras.length === 0) {
      // 初始化摄像头
      if (this.containers.length === 0) {
        throw new Error("找不到容器");
      }
      this.addCamera(this.containers[0], this.name + ".camera.0", 50, 1, 50000);
    }
    return this.cameras[0].camera.camera;
  }

  /**
   * 销毁场景，释放内存
   */
  destroy() {
    this.scene.clear();
    this.renders.forEach(render => {
      render.render.destroy();
    });
    this.cameras.forEach(camera => {
      camera.camera.destroy();
    });
  }

}
