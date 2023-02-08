import { OrbitControls, THREE } from "@/components/threejs/three";
import { Scene } from "@/components/threejs/objects/scene";
import { generateUUID } from "three/src/math/MathUtils";

/**
 * 相机封装
 * @author jfh
 */
export class SceneCamera {

  id: string;

  name: string;

  fov: number;

  near: number;

  far: number;

  scene: Scene;

  container: Element;

  camera: THREE.PerspectiveCamera;

  control: OrbitControls;

  constructor(name: string, fov: number, near: number, far: number, container: Element);
  constructor(id: string, name: string, fov: number, near: number, far: number, container: Element);
  constructor(id?: string, name: string, fov: number, near: number, far: number, container: Element) {

    if (id) {
      this.id = id;
    } else {
      this.id = generateUUID();
    }
    this.name = name;
    this.fov = fov;
    this.far = far;
    this.near = near;
    this.container = container;
    // 摄像机视锥体长宽比
    let aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // 构造控制器
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
    // 控制方式
    this.control.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
  }

  init() {

  }

  destroy() {
    this.control.dispose();
    this.camera.clear();
    this.camera.removeFromParent();
  }

}
