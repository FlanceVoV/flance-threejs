import { Scene } from "@/components/threejs/objects/scene";
import { generateUUID } from "three/src/math/MathUtils";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";

/**
 * scene导出器
 * @author jhf
 */
export class SceneExporter {

  id: string;

  name: string;

  scene: Scene;

  gltfExporter: GLTFExporter;

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
    this.gltfExporter = new GLTFExporter();
  }

  init() {

  }

  /**
   * 导出整个场景为gltf
   */
  exportSceneGLTF() {
    this.gltfExporter.parse(this.scene.scene, (res) => {
        if (res instanceof ArrayBuffer) {
          this.save(new Blob([res], { type: "application/octet-stream" }), "scene.glb");
        } else {
          const output = JSON.stringify(res, null, 2);
          this.save(new Blob([output], { type: "text/plain" }), "scene.gltf");
        }
      },
      {
        // 如果设置为false，则禁用对几何体的平移、旋转和缩放。
        trs: false,
        // 如果设置为true，则只导出可见几何体。
        onlyVisible: true,
        // 如果设置为true，则将几何体的渲染范围限制为当前渲染的数据。
        truncateDrawRange: true,
        // 如果设置为true，则导出二进制glTF文件，否则导出JSON格式的glTF文件。
        binary: false,
        // 如果设置为true，则强制使用索引。
        forceIndices: false,
        // 如果设置为true，则强制使用2的幂次方纹理贴图。
        forcePowerOfTwoTextures: false
      });
  }

  setGlTFExporter() {

  }

  save(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.download = filename;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // 释放一个通过 URL.createObjectURL() 方法创建的 URL,防止内存泄漏
    URL.revokeObjectURL(url);
  }

}
