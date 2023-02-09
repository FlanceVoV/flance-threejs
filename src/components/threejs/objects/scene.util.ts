import { THREE } from "@/components/threejs/three";
import { Scene } from "@/components/threejs/objects/scene";

/**
 * 工具
 * @author jhf
 */
export class SceneUtil {

  /**
   * 获取webgl坐标
   * @param container
   * @param event
   */
  static getWebGlCoordinate(container: HTMLElement, event: any): { x: number; y: number } {
    // 可能有屏幕有侧边栏，位置偏移问题
    let getBoundingClientRect = container.getBoundingClientRect();

    // 获取屏幕坐标即鼠标的坐标以左上角为原点在第四象限(减去画布左侧菜单和顶部菜单)
    let eventX =
      event.clientX - getBoundingClientRect.left - document.body.scrollLeft;
    let eventY =
      event.clientY - getBoundingClientRect.top - document.body.scrollTop;

    /*
      转换为标指设备坐标以中心为原点
      注意：屏幕坐标y轴是反过来的
      把整个画布当成一个矩形，屏幕坐标转为标指坐标，相当于把原点移到矩形的中心
      也就是说，x轴向右，y轴向下（右正 下负）
      原坐标压缩，x -> w/2 ,y -> -h/2  （w矩形宽度  y矩形高度）
      转换公式：
      X = (x/w) * 2 - 1
      Y = - (y/h) * 2 + 1

      推导：
      1. 新原点 = (w/2, h/2)
      即 cx = w/2 cy = h/2 = > (cx, cy)

      2. 新的坐标(x', y') 到 (cx, cy)
      x' = x - cx
      y' = -(y - cy)

      3. 将(x', y')标准化到[-1, 1]，即同时除以 cx, cy
      x'/cx ,y'/cy
      [(x - c/x) / cx] = [x/cx - 1] = [x/(w/2) - 1] = [x/w * 2 - 1]
      [-(y - c/y) / cy] = [-y/cy + 1] = [-y/(h/2) + 1] = [-y/h * 2 + 1]
     */
    let xNum = (eventX / container.offsetWidth) * 2 - 1;
    let yNum = -(eventY / container.offsetHeight) * 2 + 1;

    return { x: xNum, y: yNum };
  }

  /**
   * 主窗口创建射线扫描
   * @param scene     场景
   * @param event     鼠标事件
   */
  static create2dRayWithMainWindow(scene: Scene, event: any): THREE.Raycaster {
    let coordinate = SceneUtil.getWebGlCoordinate(scene.getFirstRender().render.renderer.domElement, event);
    let pointer = new THREE.Vector2();
    pointer.set(coordinate.x, coordinate.y);
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, scene.getFirstCamera().camera.camera);
    scene.getFirstRender().render.renderer.setPixelRatio(window.devicePixelRatio);
    return raycaster;
  }
}
