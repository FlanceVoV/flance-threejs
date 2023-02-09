import { OrbitControls, THREE } from "@/components/threejs/three";
import { generateUUID } from "three/src/math/MathUtils";
import { MOUSE } from "three/src/Three";
import { SceneRender } from "@/components/threejs/objects/scene.render";

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

  container: HTMLElement;

  camera: THREE.PerspectiveCamera;

  render: SceneRender;

  control: OrbitControls;

  constructor(name: string, fov: number, near: number, far: number, render: SceneRender);
  constructor(name: string, fov: number, near: number, far: number, render: SceneRender, id: string);
  constructor(name: string, fov: number, near: number, far: number, render: SceneRender, id?: string) {

    if (id) {
      this.id = id;
    } else {
      this.id = generateUUID();
    }
    this.name = name;
    this.fov = fov;
    this.far = far;
    this.near = near;
    this.container = render.renderer.domElement;
    this.render = render;
    // 摄像机视锥体长宽比
    let aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.name = this.name + ".camera.default";

    // 构造控制器
    this.control = new OrbitControls(this.camera, this.container);
    this.init();
  }

  init() {
    this.defaultCtrl();
    this.setPosition();
    this.setLookAt();
  }

  move() {

  }

  setCamera(camera: THREE.PerspectiveCamera, name: string, fov: number, aspect: number, near: number, far: number) {
    this.destroy();
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera = camera;
    this.camera.name = this.name + ".camera." + name;
  }

  setControl(name: string,
             mouseButtons: Partial<{ LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE }>,
             keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string }) {
    this.clearControl();
    this.control = new OrbitControls(this.camera, this.container);
    this.control.mouseButtons = mouseButtons;
    this.control.keys = keys;
  }

  setPosition() {
    this.camera.position.set(0, 1000, 0);
  }

  setLookAt() {
    this.camera.lookAt(0, 0, 0);
  }

  defaultCtrl() {
    // 控制方式
    this.control.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE
    };

    this.control.keys = {
      LEFT: "KeyA",
      RIGHT: "KeyD",
      UP: "Space",
      BOTTOM: "ControlLeft"
    }
  }

  clearCamera() {
    this.camera.clear();
    this.camera.removeFromParent();
  }

  clearControl() {
    this.control.dispose();
  }

  destroy() {
    this.clearCamera();
    this.clearControl();
  }

  keyEvent() {

  }

}
