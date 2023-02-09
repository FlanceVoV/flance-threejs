import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { generateUUID } from "three/src/math/MathUtils";
import { DRACOLoader } from "@/components/threejs/three";
import { Scene } from "@/components/threejs/objects/scene";

/**
 * 加载器封装
 * @author jhf
 */
export class SceneLoader {

  id: string;

  name: string;

  gltfLoader: GLTFLoader;

  scene: Scene;

  constructor(name: string, scene: Scene);
  constructor(name: string, scene: Scene, id: string);
  constructor(name: string, scene: Scene, id?: string) {
    this.name = name;
    if (id) {
      this.id = id;
    } else {
      this.id = generateUUID();
    }
    this.scene = scene;
    // 初始化gltf、glb加载器
    this.gltfLoader = new GLTFLoader();
  }

  init() {
    this.setGltfLoader();
  }

  /**
   * 加载模型
   * @param url       模型地址
   * @param position  位置
   * @param scale     大小缩放
   * @param rotation  旋转
   */
  loadGltf(url: string, position: { x: number, y: number, z: number }, scale: { x: number, y: number, z: number }, rotation: { x: number, y: number, z: number }) {
    this.gltfLoader.load(url, (gltf) => {
      let root = gltf.scene;
      root.position.set(position.x, position.y, position.z);
      root.scale.set(scale.x, scale.y, scale.z);
      root.rotation.set(rotation.x, rotation.y, rotation.z);
      this.scene.pushObject(root);
    });
  }

  /**
   * gltf加载器设置
   */
  setGltfLoader() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/src/static/js/draco/gltf/");
    dracoLoader.setDecoderConfig({ type: "js" });
    this.gltfLoader.setDRACOLoader(dracoLoader);
  }

}
