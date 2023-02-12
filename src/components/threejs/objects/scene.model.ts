import { generateUUID } from 'three/src/math/MathUtils';
import { BoxHelper, Object3D } from 'three';
import { Scene } from '@/components/threejs/objects/scene';
import { THREE } from '@/components/threejs/three';
import { Material } from 'three/src/materials/Material';
import { SceneUtil } from '@/components/threejs/objects/scene.util';
import { SceneMouse } from '@/components/threejs/objects/scene.mouse';

/**
 * 业务模型封装
 * @author jhf
 */
export class SceneModel {
  id: string;

  name: string;

  object: Object3D;

  boxHelper: BoxHelper | undefined | null;

  highLight: Material | undefined | null;

  scene: Scene;

  addModel: boolean = false;

  constructor(name: string, object: Object3D, scene: Scene);
  constructor(
    name: string,
    object: Object3D,
    scene: Scene,
    addModel: boolean,
    id?: string
  );
  constructor(
    name: string,
    object: Object3D,
    scene: Scene,
    addModel?: boolean,
    id?: string
  ) {
    if (id) {
      this.id = id;
    } else {
      this.id = generateUUID();
    }
    if (addModel) {
      this.addModel = addModel;
    }
    this.name = name;
    this.object = object;
    this.object.name = this.name + '.object';
    this.scene = scene;
    if (this.addModel) {
      this.scene.addObject(this.object);
    } else {
      this.scene.pushObject(this.object);
    }
  }

  init() {}

  /**
   * 设置透明
   */
  setTransparent() {}

  /**
   * 跟随鼠标移动
   */
  moveByMouse(event: any) {}

  /**
   * 鼠标移入
   */
  mouseMoveOn(color: string) {
    if (this.highLight) {
      return;
    }
    this.highLight = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.BackSide,
    });
    this.highLight.name = this.name + '.highLight';
    let obj = this.object as any;
    obj.originMaterial = obj.material;
    obj.setMaterial(this.highLight, true);
  }

  /**
   * 鼠标移出
   */
  mouseMoveOut() {
    let obj = this.object as any;
    obj.setMaterial(obj.originMaterial, true);
    obj.originMaterial = null;
  }

  /**
   * 选中
   */
  selected(color: string) {
    if (this.boxHelper) {
      return;
    }
    this.boxHelper = new BoxHelper(this.object, color);
    this.boxHelper.name = this.name + '.boxHelper';
    this.scene.addObject(this.boxHelper);
  }

  /**
   * 取消选中
   */
  unselected() {
    if (this.boxHelper) {
      this.scene.removeNoScanObject(this.boxHelper);
      this.boxHelper.dispose();
    }
    return;
  }

  destroy() {
    this.object.remove();
    this.object.removeFromParent();
  }
}
