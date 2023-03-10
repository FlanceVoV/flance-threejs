import { THREE } from '@/components/threejs/three';
import { generateUUID } from 'three/src/math/MathUtils';
import { SceneCamera } from '@/components/threejs/objects/scene.camera';

/**
 * 渲染器封装
 * @author jhf
 */
export class SceneRender {
  id: string;

  name: string;

  scene: THREE.Scene;

  container: Element;

  renderer: THREE.WebGLRenderer;

  constructor(name: string, scene: THREE.Scene, container: Element);
  constructor(name: string, scene: THREE.Scene, container: Element, id: string);
  constructor(
    name: string,
    scene: THREE.Scene,
    container: Element,
    id?: string
  ) {
    this.name = name;
    if (id) {
      this.id = id;
    } else {
      this.id = generateUUID();
    }
    this.scene = scene;
    this.container = container;
    this.renderer = new THREE.WebGLRenderer();

    this.init();
  }

  init() {
    this.setDefaultRender();
  }

  setDefaultRender() {
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    // 设置大小
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.domElement.style.outline = 'none';
    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * 初始化默认摄像头渲染
   */
  initRenderLoopBySceneCamera(sceneCamera: SceneCamera) {
    this.renderer.setAnimationLoop(() => this.renderBySceneCamera(sceneCamera));
  }

  /**
   * 停止渲染
   */
  clearRenderLoop() {
    this.renderer.setAnimationLoop(null);
  }

  /**
   * 执行渲染
   * @param sceneCamera 摄像头
   */
  renderBySceneCamera(sceneCamera: SceneCamera) {
    let scene = this.scene;
    let camera = sceneCamera.camera;
    this.renderer.render(scene, camera);
  }

  /**
   * 销毁，释放内存
   */
  destroy() {
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.clearRenderLoop();
    // this.renderer.content = null;
    let gl = this.renderer.domElement.getContext('webgl');
    if (gl) {
      let ext = gl.getExtension('WEBGL_lose_context');
      if (ext) {
        ext.loseContext();
      }
    }
  }
}
