import { THREE } from "@/components/threejs/three";
import { Scene } from "@/components/threejs/objects/scene";
import { BufferGeometry, Line } from "three";
import { SceneModel } from "@/components/threejs/objects/scene.model";
import { generateUUID } from "three/src/math/MathUtils";
import { SceneUtil } from "@/components/threejs/objects/scene.util";

/**
 * 直线
 * @author jhf
 */
export class SceneStraightLine {

  start: THREE.Vector3;

  end: THREE.Vector3;

  id: string;

  name: string;

  line: Line;

  model: SceneModel;

  scene: Scene;

  onMove: boolean = false;

  constructor(name: string, scene: Scene, start: THREE.Vector3, end: THREE.Vector3, id?: string) {
    this.scene = scene;
    this.name = name;

    if (id) {
      this.id = id;
    } else {
      this.id = generateUUID();
    }

    // 创建连线的两个端点
    this.start = start;
    this.end = end;

    let geometry = new BufferGeometry();
    geometry.setFromPoints([start, end]);
    let material = new THREE.LineDashedMaterial({
      color: 0x00ffff,
      scale: 0,
      linewidth: 25
    });
    this.line = new Line( geometry, material );
    this.model = new SceneModel(name, this.line, scene, true);
  }

  /**
   * 线的一端跟随鼠标移动
   * @param event
   */
  move(event: any) {
    if (!this.onMove) {
      return;
    }
    // 获取二维坐标
    let xy = SceneUtil.getWebGlCoordinate(this.scene.getFirstRender().render.renderer.domElement, event);
    // 创建射线
    let raycaster = SceneUtil.create2dRayWithMainWindow(this.scene, event);
    this.end.set(xy.x, xy.y, 0);
    raycaster.setFromCamera(this.end, this.scene.getFirstCamera().camera.camera);
    // 射线照射到的模型
    const intersects = raycaster.intersectObjects(this.scene.objects, false);
    if (intersects.length > 0) {
      const intersect: any = intersects[0];
      this.end.copy(intersect.point).add(intersect.face.normal);
      this.line.geometry.setFromPoints([this.start, this.end]);
      this.line.geometry.attributes.position.needsUpdate = true;
    }
  }

  startMove() {
    this.onMove = true;
  }

  stopMove() {
    this.onMove = false;
  }

  destroy() {
    this.model.destroy();
  }

}
