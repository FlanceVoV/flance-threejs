import { THREE } from '@/components/threejs/three';
import { Scene } from './scene';
import { SceneUtil } from "@/components/threejs/objects/scene.util";

/**
 * three scene 操作 api
 * @author jhf
 */
export class SceneApi {
  scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * 再鼠标移动位置生成红色方块指示器
   * @param event       事件
   * @param container   选取元素
   * @param objects     raycaster扫描到的所有模型保存数组
   */
  mouseMoveWithRedMesh(event: any, container: HTMLElement, objects: []) {
    // 获取二维化的鼠标坐标
    let webGlCoordinate = this.getWebGlCoordinate(container, event);
    this.scene.pointer.set(webGlCoordinate.x, webGlCoordinate.y);

    let raycaster = this.create2dRay(event, container);
    raycaster.setFromCamera(this.scene.pointer, this.scene.camera);
    const intersects = raycaster.intersectObjects(objects, false);
    if (intersects.length > 0) {
      const intersect: any = intersects[0];
      if (intersect) {
        this.scene.mouseMesh.position
          .copy(intersect.point)
          .add(intersect.face.normal);
        this.scene.mouseMesh.position
          .divideScalar(25)
          .floor()
          .multiplyScalar(25)
          .addScalar(12.5);
        if (this.scene.mouseMesh.geometry.type === 'PlaneGeometry') {
          this.scene.mouseMesh.position.y = 0;
        }
        this.scene.render();
      }
    }
  }

  initDefaultSceneView(scene: Scene, objects: Array<any>) {
    // 画网格
    scene.drawGridHelper();

    // 中心
    scene.drawCenter();

    // 添加地面
    objects.push(scene.plane);

    // 逐帧绘制
    scene.renderer.setAnimationLoop(() => scene.render());
  }

  /**
   * 移动选中的所有模型
   * @param selectedObjects   选中的模型
   */
  moveObjectWithMouse(
    selectedObjects: Array<{ key: string; helper: any; intersect: any }>
  ) {
    if (
      selectedObjects &&
      selectedObjects.length &&
      selectedObjects.length > 0
    ) {
      selectedObjects.forEach((obj: any) => {
        obj.intersect.object.position.set(
          obj.intersect.object.position.x,
          this.scene.mouseMesh.position.y,
          obj.intersect.object.position.z
        );
      });
    }
  }

  create3dMouseDefault() {
    this.clearModelWithName([], ['mouseCtrl']);
    let cubeSize = this.scene.size / this.scene.divisions;
    const rollOverGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    let rollOverMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    });
    let rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    rollOverMesh.name = 'mouseCtrl';
    rollOverGeo.name = 'mouseCtrl';
    rollOverMaterial.name = 'mouseCtrl';
    this.scene.mouseMesh = rollOverMesh;
    this.scene.scene.add(rollOverMesh);
  }

  create3dMouseByModel(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    mesh: THREE.Mesh
  ) {
    this.clearModelWithName([], ['mouseCtrl']);
    mesh.name = 'mouseCtrl';
    geometry.name = 'mouseCtrl';
    material.name = 'mouseCtrl';
    this.scene.mouseMesh = mesh;
    this.scene.scene.add(mesh);
  }

  create2dMouse() {
    this.clearModelWithName([], ['mouseCtrl']);
    let cubeSize = this.scene.size / this.scene.divisions;
    // 鼠标几何（场景大小/场景分割份数）
    let rollOverGeo = new THREE.PlaneGeometry(cubeSize, cubeSize);
    // 鼠标材质
    rollOverGeo.name = 'mouseCtrl';
    let rollOverMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    });
    rollOverMaterial.name = 'mouseCtrl';
    // 鼠标方块平面
    let rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
    rollOverMesh.name = 'mouseCtrl';
    // 旋转
    rollOverMesh.rotateX(-Math.PI / 2);
    this.scene.mouseMesh = rollOverMesh;
    this.scene.scene.add(rollOverMesh);
  }

  /**
   * raycaster射线扫描位置生成立方体（测试用）
   * @param intersect   raycaster射线扫描出来的模型区域
   */
  mouseClickCreateCube(intersect: any): THREE.Mesh {
    let cube = new THREE.Mesh(
      new THREE.BoxGeometry(25, 100, 25),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    cube.name = 'myCube';
    cube.position.copy(intersect.point).add(intersect.face.normal);
    cube.position.divideScalar(25).floor().multiplyScalar(25).addScalar(12.5);
    this.scene.scene.add(cube);
    this.scene.render();
    return cube;
  }

  /**
   * raycaster射线扫描位置生成鼠标模型（测试用）
   * @param intersect   raycaster射线扫描出来的模型区域
   */
  mouseClickCreateByMouse(intersect: any): THREE.Mesh {
    let mesh = new THREE.Mesh(
      this.scene.mouseMesh.geometry,
      this.scene.mouseMesh.material
    );
    mesh.name = 'myCube';
    mesh.position.copy(intersect.point).add(intersect.face.normal);
    mesh.position.divideScalar(25).floor().multiplyScalar(25).addScalar(12.5);
    this.scene.scene.add(mesh);
    this.scene.render();
    return mesh;
  }

  /**
   * 根据数组执行回滚操作
   * @param objects       操作模型记录
   * @param undoObjects   回滚操作记录
   */
  undoWithCacheArray(objects: Array<any>, undoObjects: Array<any>) {
    if (objects.length > 1) {
      let undo = objects[objects.length - 1];
      undoObjects.push(undo);

      if (undo.dispose) {
        undo.dispose();
      }

      if (undo.remove) {
        undo.remove();
      }
      this.scene.scene.remove(undo);
      objects.length -= 1;
      this.scene.render();
    }
  }

  /**
   * 根据数组执行恢复操作
   * @param objects       操作模型记录
   * @param undoObjects   回滚操作记录
   */
  redoWithCacheArray(objects: Array<any>, undoObjects: Array<any>) {
    if (undoObjects.length > 0) {
      let redo = undoObjects[undoObjects.length - 1];
      this.scene.scene.add(redo);
      objects.push(redo);
      this.scene.render();
      undoObjects.length -= 1;
    }
  }

  /**
   * 根据名称删除模型（不传名称，会删除整个场景中的所有元素）
   * @param whiteList   白名单，此数组中的模型 不会删除
   * @param blackList   黑名单，如果有黑名单，则会指定删除，只删黑名单中的（白名单不删）
   */
  clearModelWithName(whiteList: Array<string>, blackList: Array<string>) {
    let allChildren = this.scene.scene.children;
    if (blackList.length > 0) {
      for (let i = allChildren.length - 1; i >= 0; i -= 1) {
        let child: any = allChildren[i];
        if (whiteList.indexOf(child.name, 0) !== -1) {
          continue;
        }
        if (blackList.indexOf(child.name, 0) !== -1) {
          this.dispose(this.scene.scene, child);
        }
      }
    } else {
      for (let i = allChildren.length - 1; i >= 0; i -= 1) {
        let child: any = allChildren[i];
        if (whiteList.indexOf(child.name, 0) !== -1) {
          continue;
        }
        this.dispose(this.scene.scene, child);
      }
    }

    // 重置相机位置
    // this.scene.camera.position.set(0, 1100, 0);
    // this.scene.camera.lookAt(0, 0, 0);

    // 鼠标回中
    this.scene.mouseMesh.position.x = 0;
    this.scene.mouseMesh.position.y = 0;
    this.scene.mouseMesh.position.z = 0;
  }

  /**
   * 递归删除模型
   * @param parent
   * @param child
   */
  dispose(parent: any, child: any) {
    if (child.children.length) {
      let arr = child.children.filter((x: any) => x);
      arr.forEach((obj: any) => {
        this.dispose(child, obj);
      });
    }
    if (child.type === 'Mesh' || child.type === 'Line') {
      if (child.material.map) {
        if (child.material.map.dispose) {
          child.material.map.dispose();
        }
      }
      if (child.material.dispose) {
        child.material.dispose();
      }
      if (child.geometry.dispose) {
        child.geometry.dispose();
      }
    } else if (child.material) {
      if (child.material.dispose) {
        child.material.dispose();
      }
    }
    if (child.remove) {
      child.remove();
    }
    if (parent.remove) {
      parent.remove(child);
    }
  }

  /**
   * 单个模型删除
   * @param intersect   射线扫描到的对象
   */
  removeOne(intersect: any) {
    if (intersect.object) {
      this.dispose(this.scene.scene, intersect.object);
    }
  }

  /**
   * 获取webgl坐标
   * @param container
   * @param event
   */
  getWebGlCoordinate(
    container: HTMLElement,
    event: any
  ): { x: number; y: number } {
    return SceneUtil.getWebGlCoordinate(container, event);
  }

  /**
   * 获取世界坐标
   * @param container
   * @param event
   */
  getWorldCoordinate(container: HTMLElement, event: any) {
    let webGlCoordinate = this.getWebGlCoordinate(container, event);
  }

  /**
   * 扫描的模型描边
   * @param selectedObjects
   */
  outline(
    selectedObjects: Array<{ key: string; helper: any; intersect: any }>
  ) {
    if (selectedObjects && selectedObjects.length > 0) {
      selectedObjects.forEach((obj) => {
        let intersect = obj.intersect;
        let outlineMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.BackSide,
        });
        let outlineMesh = new THREE.Mesh(
          intersect.object.geometry,
          outlineMaterial
        );
        outlineMesh.name = 'outlineMesh';
        outlineMesh.position.set(
          intersect.object.position.x,
          intersect.object.position.y,
          intersect.object.position.z
        );
        outlineMesh.scale.set(1.2, 1.2, 1.2);
        this.scene.scene.add(outlineMesh);
      });
    }
  }

  /**
   * 扫描的模型变色
   * @param selectedObjects
   */
  outColor(
    selectedObjects: Array<{ key: string; helper: any; intersect: any }>
  ) {
    if (selectedObjects && selectedObjects.length > 0) {
      selectedObjects.forEach((obj) => {
        let intersect = obj.intersect;
        let outlineMaterial = new THREE.MeshBasicMaterial({
          color: 'white',
          side: THREE.BackSide,
        });
        // intersect.object.material = outlineMaterial;
        outlineMaterial.name = 'selectedOutColor';
        intersect.object.originMaterial = intersect.object.material;
        intersect.object.material = outlineMaterial;
      });
    }
  }

  /**
   * 创建贴图
   */
  createTexture(intersect: any) {
    let textureLoader = new THREE.TextureLoader();
    intersect.object.material = new THREE.MeshBasicMaterial({
      map: textureLoader.load("http://localhost:8080/src/assets/logo.svg")
    })
  }

  /**
   * 场景变换
   */
  changeScene() {
    let textureLoader = new THREE.TextureLoader();
    this.scene.scene.background = textureLoader.load("http://localhost:8080/src/assets/test_scene_back.png");
    let texture = textureLoader.load("http://localhost:8080/src/assets/test_plane_back.png");
    texture.magFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(13, 10);
    this.scene.plane.material = new THREE.MeshBasicMaterial({
      visible: true,
      map:  texture
    })
  }

  /**
   * 扫描的取消模型变色
   * @param selectedObjects
   */
  clearOutColor(
    selectedObjects: Array<{ key: string; helper: any; intersect: any }>
  ) {
    if (selectedObjects && selectedObjects.length > 0) {
      selectedObjects.forEach((obj) => {
        let intersect = obj.intersect;
        intersect.object.material = intersect.object.originMaterial;
        this.clearModelWithName([], ['selectedOutColor']);
      });
    }
  }

  /**
   * 创建三维射线
   * @param event
   * @param container
   */
  create3dRay(event: any, container: HTMLElement): THREE.Raycaster {
    // 2d
    let coordinate = this.getWebGlCoordinate(container, event);

    // 标准设备坐标
    let standardVector = new THREE.Vector3(coordinate.x, coordinate.y, 0.5);
    // 通过unproject方法，可以将标准设备坐标转世界坐标
    let worldVector = standardVector.unproject(this.scene.camera);
    let ray = worldVector.sub(this.scene.camera.position).normalize();
    return new THREE.Raycaster(this.scene.camera.position, ray);
  }

  create2dRay(event: any, container: HTMLElement): THREE.Raycaster {
    let coordinate = this.getWebGlCoordinate(container, event);
    this.scene.pointer.set(coordinate.x, coordinate.y);
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(this.scene.pointer, this.scene.camera);
    this.scene.renderer.setPixelRatio(window.devicePixelRatio);
    return raycaster;
  }

  /**
   * 选择一个模型
   * @param event             事件
   * @param container         dom元素
   * @param selectedObjects   已经选中的元数集合（用于支持多选及反选）
   */
  chooseOneModel(
    event: any,
    container: HTMLElement,
    selectedObjects: Array<{ key: string; helper: any; intersect: any }>
  ): any {
    // 获取三维射线
    let rayCaster = this.create2dRay(event, container);
    const intersects = rayCaster.intersectObjects(
      this.scene.scene.children,
      true
    );
    if (intersects.length > 0) {
      for (let i = intersects.length - 1; i >= 0; i -= 1) {
        if (
          intersects[i].object &&
          intersects[i].object.name &&
          (intersects[i].object.name === 'mouseCtrl' ||
            intersects[i].object.name === 'axesHelper' ||
            intersects[i].object instanceof THREE.BoxHelper)
        ) {
          intersects.splice(i, 1);
        }
      }

      const intersect: any = intersects[0];

      // 反选
      for (let i = selectedObjects.length - 1; i >= 0; i -= 1) {
        if (selectedObjects[i].key === intersect.object.uuid) {
          selectedObjects[i].helper.dispose();
          selectedObjects[i].helper.remove();
          this.scene.scene.remove(selectedObjects[i].helper);
          selectedObjects.splice(i, 1);
          return null;
        }
      }

      if (
        intersect.object &&
        intersect.object !== this.scene.plane &&
        intersect.object !== this.scene.mouseMesh &&
        intersect.object !== this.scene.axesHelper
      ) {
        let helper = new THREE.BoxHelper(intersect.object, 'blue');
        helper.name = 'boxHelper';
        this.scene.scene.add(helper);
        selectedObjects.push({
          key: intersect.object.uuid,
          helper,
          intersect,
        });
        this.scene.render();
        return intersect.object;
      }
    }
    return null;
  }

  /**
   * 清除选择
   * @param selectedObjects   已选中的模型
   */
  clearChooseModels(
    selectedObjects: Array<{ key: string; helper: any; intersect: any }>
  ) {
    if (selectedObjects.length > 0) {
      for (let i = selectedObjects.length - 1; i >= 0; i -= 1) {
        this.scene.scene.remove(selectedObjects[i].helper);
      }
      selectedObjects.splice(0);
    }
  }

  /**
   * 摄像头照射向物体
   * @param intersect
   */
  viewToModel(intersect: any) {
    this.scene.camera.position.set(
      intersect.position.x + 100,
      intersect.position.y + 100,
      intersect.position.z + 100
    );
    this.scene.camera.lookAt(intersect.position);
  }

  createMaterial(intersect: any) {}

  createLight() {}
}
