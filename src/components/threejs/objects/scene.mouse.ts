import { generateUUID } from "three/src/math/MathUtils";
import { THREE } from "@/components/threejs/three";
import { Scene } from "@/components/threejs/objects/scene";
import { SceneUtil } from "@/components/threejs/objects/scene.util";

/**
 * 鼠标模型
 * @author jhf
 */
export class SceneMouse {

  id: string;

  name: string;

  pointer: THREE.Vector2;

  /**
   * 场景
   */
  scene: Scene;

  /**
   * 鼠标几何
   */
  geometry: THREE.BufferGeometry;

  /**
   * 鼠标材质
   */
  material: THREE.Material | THREE.Material[] ;

  /**
   * 鼠标模型
   */
  mouseMesh: THREE.Mesh;


  constructor(name: string, scene: Scene, geometry: THREE.BufferGeometry, material: THREE.Material);
  constructor(name: string, scene: Scene, geometry: THREE.BufferGeometry, material: THREE.Material, id: string);
  constructor(name: string, scene: Scene, geometry: THREE.BufferGeometry, material: THREE.Material, id?: string) {

    if (id) {
      this.id = id;
    } else {
      this.id = generateUUID();
    }

    this.scene = scene;
    this.name = name;
    this.material = material;
    this.geometry = geometry;
    this.mouseMesh = new THREE.Mesh(geometry, material);
    this.mouseMesh.name = this.name + ".mouseMesh";
    this.pointer = new THREE.Vector2();

    this.init();
  }

  init () {
    this.addMouse();
  }

  move(event: any, addScalar: number) {
    // 获取二维坐标
    let xy = SceneUtil.getWebGlCoordinate(this.scene.getFirstRender().render.renderer.domElement, event);
    // 创建射线
    let raycaster = SceneUtil.create2dRayWithMainWindow(this.scene, event);
    this.pointer.set(xy.x, xy.y);
    raycaster.setFromCamera(this.pointer, this.scene.getFirstCamera().camera.camera);
    // 射线照射到的模型
    const intersects = raycaster.intersectObjects(this.scene.objects, false);
    if (intersects && intersects.length > 0) {
      const intersect: any = intersects[0];
      this.mouseMesh.position.copy(intersect.point).add(intersect.face.normal);
      this.mouseMesh.position
        .divideScalar(this.scene.size / this.scene.divisions)
        .floor()
        .multiplyScalar(this.scene.size / this.scene.divisions)
        .addScalar(addScalar);
      this.scene.getFirstRender().render.renderFirst();
    }
  }

  addMouse() {
    this.scene.addObject(this.mouseMesh);
  }

  setMouse(mouse: THREE.Mesh) {
    this.destroy();
    this.mouseMesh = mouse;
    this.geometry = mouse.geometry;
    this.material = mouse.material;
  }

  setMouseByGeo(geometry: THREE.BufferGeometry, material: THREE.Material) {
    this.clearMouse();
    this.geometry = geometry;
    this.material = material;
    this.mouseMesh = new THREE.Mesh(geometry, material);
  }

  clearMouse() {
    this.mouseMesh.removeFromParent();
    this.mouseMesh.remove();
  }

  clearModel() {
    if (this.material instanceof Array) {
      this.material.forEach(m => {
        m.dispose();
      })
    } else {
      this.material.dispose();
    }
    this.geometry.dispose();
  }

  destroy() {
    this.clearModel();
    this.clearMouse();
  }

}
