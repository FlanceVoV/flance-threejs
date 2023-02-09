import { THREE } from "@/components/threejs/three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { generateUUID } from "three/src/math/MathUtils";
import { DRACOLoader } from "@/components/threejs/three";
import { Scene } from "@/components/threejs/objects/scene";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

/**
 * 加载器封装
 * @author jhf
 */
export class SceneLoader {

  id: string;

  name: string;

  gltfLoader: GLTFLoader;

  fontLoader: FontLoader;

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

    // 初始化文字加载器
    this.fontLoader = new FontLoader();
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
   * 加载文字
   * @param fonts 字体
   * @param msg   文字
   */
  loadFont(fonts: string, msg: string) {
    this.fontLoader.load(fonts, (font) => {
      let textGeo = new TextGeometry(msg, {
        font: font,
        size: 50,
        height: 10,
      });
      let materials = [
        // front
        new THREE.MeshPhongMaterial({ color: 0xff0000, flatShading: true }),
        // side
        new THREE.MeshPhongMaterial({ color: 0xffff00 })
      ];
      let textMesh = new THREE.Mesh(textGeo, materials);
      textMesh.rotateX(-Math.PI / 2);
      this.scene.pushObject(textMesh);
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

  /**
   * font加载器
   */
  setFontLoader() {

  }

}
