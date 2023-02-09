<template>
  <div>
    <div class="container" style="width: 100%; height: 100%; ">
      <div>header</div>
      <div
        id="content"
        style="
        position: absolute;
        width: 300px;
        height: 300px;
      "
        @contextmenu="void 0"
      >
      </div>
      <div style="height: 320px"></div>

      <div id="content2"
           style="
        position: absolute;
        width: 300px;
        height: 300px;
      "
           @contextmenu="void 0">

      </div>
      <div>
        footer
      </div>
    </div>
  </div>

</template>

<script lang="ts">

import { Scene } from "@/components/threejs/objects/scene";
import { SceneMouse } from "@/components/threejs/objects/scene.mouse";
import { THREE } from "@/components/threejs/three";
import { SceneLoader } from "@/components/threejs/objects/scene.loader";
import { SceneExporter } from "@/components/threejs/objects/scene.exporter";

let mouse: SceneMouse;
let scene: Scene;
let loader: SceneLoader;
let exporter: SceneExporter;

export default ({
  data() {
    return {};
  },

  mounted() {
    let that = this as any;
    scene = new Scene("测试场景", ["#content", "#content2"]);
    mouse = new SceneMouse("测试鼠标", scene,
      new THREE.BoxGeometry(25, 25, 25),
      new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    }));
    scene.getFirstRender().render.renderer.domElement.addEventListener("pointermove", that.onPointerMove, false);
    loader = new SceneLoader("测试加载器", scene);
    loader.loadFont("/src/static/fonts/STKaiti_Regular.json", "测试");

    exporter = new SceneExporter("测试导出器", scene);

    exporter.exportSceneGLTF();
  },

  methods: {
    onPointerMove(event: any) {
      mouse.move(event);
    },
    // new 的所有模型销毁时需要手动销毁，所有自定义的封装类需要提供destroy方法，删除实例释放内存
    destroy() {
      scene.destroy();
      mouse.destroy();
    }
  }

});
</script>
