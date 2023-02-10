import { SceneModel } from "@/components/threejs/objects/scene.model";
import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { Scene } from "@/components/threejs/objects/scene";
import { THREE } from "@/components/threejs/three";

/**
 * 立方体封装
 * @author jhf
 */
export class SceneBox {

  name: string;

  height: number = 20;

  width: number = 20;

  depth: number = 20;

  scene: Scene;

  /**
   * 多面
   */
  widthSegments: number = 1;
  heightSegments: number = 1;
  depthSegments: number = 1;

  model: SceneModel;

  object: Mesh;


  constructor(name: string, scene: Scene, height?: number, width?: number, depth?: number, id?: string) {
    this.name = name;
    this.scene = scene;
    if (height) {
      this.height = height;
    }
    if (width) {
      this.width = width;
    }
    if (depth) {
      this.depth = depth;
    }
    let boxGeometry = new BoxGeometry(this.width, this.height, this.depth);
    let boxMaterial = new MeshBasicMaterial({
      color: 'green',
    });
    let object = new Mesh(boxGeometry, boxMaterial);
    this.object = object;
    object.position.y = this.depth / 2
    this.model = new SceneModel(name, object, scene);
  }


  init() {

  }

  createMaterial(start: THREE.Vector3, end: THREE.Vector3) {
    this.model.destroy();

    // 获取起始坐标间的距离
    let distance = start.distanceTo(end);
    // 结束坐标向量+开始坐标向量
    let position = end.clone().add(start).divideScalar(2);

    let boxGeometry = new THREE.BoxGeometry(25, distance + 25, 50);
    let boxMaterial = new MeshBasicMaterial({
      color: 'red',
    });

    // 矩阵的几何变换
    // 创建矩阵
    let orientation = new THREE.Matrix4();
    //
    let offsetRotation = new THREE.Matrix4();

    orientation.lookAt(start, end, new THREE.Vector3(0, 5, 0));
    // 绕x轴旋转90°
    offsetRotation.makeRotationX(Math.PI * 0.5);
    //
    orientation.multiply(offsetRotation);

    this.object = new THREE.Mesh(boxGeometry, boxMaterial)
    this.object.applyMatrix4(orientation);
    this.object.position.set(position.x, 50 / 2, position.z)
    this.model = new SceneModel(this.name, this.object, this.scene);
  }


}
