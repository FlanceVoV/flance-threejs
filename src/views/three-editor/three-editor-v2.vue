<template>
  <div>
    <div class="container" style="width: 100%; height: 100%">
      <div>header</div>
      <div
        id="content"
        style="position: absolute; width: 1200px; height: 600px"
        @contextmenu="void 0"
      >
      </div>

      <div
        id="content2"
        style="
          position: absolute;
          z-index: auto;
          width: 300px;
          height: 300px;
          margin-left: 900px;
        "
        @contextmenu="void 0"
      >
      </div>
      <div> footer </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Scene } from '@/components/threejs/objects/scene';
  import { SceneMouse } from '@/components/threejs/objects/scene.mouse';
  import { THREE } from '@/components/threejs/three';
  import { SceneLoader } from '@/components/threejs/objects/scene.loader';
  import { SceneExporter } from '@/components/threejs/objects/scene.exporter';
  import { BoxGeometry, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';
  import { SceneModel } from '@/components/threejs/objects/scene.model';
  import { SceneStraightLine } from '@/components/threejs/objects/scene.straightline';
  import { SceneBox } from '@/components/threejs/objects/scene.box';

  let mouse: SceneMouse;
  let line: SceneStraightLine;
  let lines: Array<SceneStraightLine> = [];
  let scene: Scene;
  let loader: SceneLoader;
  let exporter: SceneExporter;

  export default {
    data() {
      return {};
    },

    mounted() {
      let that = this as any;

      scene = new Scene('测试场景', ['#content', '#content2']);
      mouse = new SceneMouse(
        '测试鼠标',
        scene,
        new THREE.BoxGeometry(25, 25, 25),
        new THREE.MeshBasicMaterial({
          color: 0xff0000,
          opacity: 0.5,
          transparent: true,
        })
      );
      scene
        .getFirstRender()
        .render.renderer.domElement.addEventListener(
          'click',
          that.onPointerClick,
          false
        );

      scene
        .getFirstRender()
        .render.renderer.domElement.addEventListener(
          'pointermove',
          that.onPointerMove,
          false
        );

      loader = new SceneLoader('测试加载器', scene);
      loader.loadFont('/src/static/fonts/STKaiti_Regular.json', '测试');

      // exporter = new SceneExporter("测试导出器", scene);

      // exporter.exportSceneGLTF();

      let sphereGeo = new BoxGeometry(100, 100, 100);
      let sphereMaterial = new MeshBasicMaterial({
        color: 'green',
      });
      let sphere = new Mesh(sphereGeo, sphereMaterial);
      sphere.position.y = 50;
      let model = new SceneModel('测试模型', sphere, scene);

      // 创建连线的两个端点
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(0, 0, 0);

      line = new SceneStraightLine('鼠标连线', scene, start, end);
      lines.push(line);
      line.startMove();

      console.log(scene);
      localStorage.setItem('scene', JSON.stringify(scene));
    },

    methods: {
      onPointerMove(event: any) {
        mouse.move(event, 12.5);
        line.move(event);
      },
      onPointerClick(event: any) {
        line.stopMove();
        let box = new SceneBox('测试墙', scene);
        box.createMaterial(line.start, line.end);
      },
      // new 的所有模型销毁时需要手动销毁，所有自定义的封装类需要提供destroy方法，删除实例释放内存
      destroy() {
        scene.destroy();
        mouse.destroy();
      },
    },
  };
</script>
