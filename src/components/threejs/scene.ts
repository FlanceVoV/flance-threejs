import { THREE, OrbitControls, GLTFLoader, DRACOLoader } from './three';

/**
 * 场景model
 * 封装 场景Scene，渲染器Renderer，摄像头Camera，光照Light，控制器controls，鼠标指针提示方块mouseMesh，地面plane，模型加载器xxxLoader，三维辅助线axesHelper
 * @author jhf
 */
export class Scene {
  public static LINE_NAME = 'customizeLine';

  scene: THREE.Scene;

  renderer: THREE.WebGLRenderer;

  camera: THREE.PerspectiveCamera;

  container: Element;

  light: THREE.PointLight;

  pointer: THREE.Vector2;

  pointer3D: THREE.Vector3;

  controls: OrbitControls;

  mouseMesh: THREE.Mesh;

  plane: THREE.Mesh;

  gltfLoader: GLTFLoader;

  axesHelper: THREE.AxesHelper;

  size = 10000;

  divisions = 400;

  hasScene: boolean = false;

  constructor(selector: string);
  constructor(selector: string, creatorScene: THREE.Scene);

  constructor(selector: string, creatorScene?: THREE.Scene) {
    let selectorDom = document.querySelector(selector);
    // 构建dom元素
    if (selectorDom) {
      this.container = selectorDom;
    } else {
      throw new Error('找不到渲染元素');
    }

    // 构造场景
    if (!creatorScene) {
      this.scene = new THREE.Scene();
    } else {
      this.scene = creatorScene;
      this.hasScene = true;
    }

    // 构建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // 构建相机
    /*
      fov 摄像机视锥体垂直视野角度。
      aspect 摄像机视锥体长宽比。
      near 摄像机视锥体近端面。
      far 摄像机视锥体远端面。
     */
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.container.clientWidth / this.container.clientHeight,
      1,
      50000
    );

    // 相机控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // 初始化光照
    this.light = new THREE.PointLight(0xffffff);

    // 二维化坐标
    this.pointer = new THREE.Vector2();

    // 三维化坐标
    this.pointer3D = new THREE.Vector3();

    // 三维辅助线
    this.axesHelper = new THREE.AxesHelper(this.size);

    // 鼠标几何（场景大小/场景分割份数）
    let rollOverGeo = new THREE.PlaneGeometry(
      this.size / this.divisions,
      this.size / this.divisions
    );
    // 鼠标材质
    rollOverGeo.name = 'mouseCtrl';
    let rollOverMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    });
    rollOverMaterial.name = 'mouseCtrl';
    // 鼠标方块平面
    this.mouseMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);

    // 初始化地面
    let geometry = new THREE.PlaneGeometry(this.size, this.size);
    geometry.rotateX(-Math.PI / 2);
    let mail = new THREE.MeshBasicMaterial({ visible: false });
    this.plane = new THREE.Mesh(geometry, mail);

    // 初始化gltf模型导入
    this.gltfLoader = new GLTFLoader();

    // 初始化
    this.init();
  }

  init() {
    console.log('开始初始化...');
    if (!this.hasScene) {
      this.initPlane();
      this.initAxesHelper();
      this.initLight();
    }
    this.initCamera();
    this.initScene();
    this.initRenderer();
    this.cameraControls();
  }

  // 初始化场景
  initScene() {
    // 场景背景（背景色）
    this.scene.background = new THREE.Color(0xffffff);
  }

  // 初始化渲染器
  initRenderer() {
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    // 设置大小
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    // 设置颜色
    // this.renderer.setClearColor(0xffffff);
    // 构建canvas画布
    this.container.appendChild(this.renderer.domElement);
  }

  // 初始化相机
  initCamera() {
    // 设置相机位置
    this.camera.position.set(0, 1100, 0);
    this.camera.lookAt(0, 0, 0);
  }

  // 相机控制器
  cameraControls() {
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.PAN,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
  }

  // 初始化灯光
  initLight() {
    this.light.name = 'pointLight';
    this.light.position.set(0, 100, 0);
    this.light.castShadow = true;
    this.scene.add(this.light);
    this.scene.add(new THREE.AmbientLight());
  }

  // 初始化二维平面（让射线可以选取）
  initPlane() {
    this.plane.name = 'Plane';
    this.plane.receiveShadow = true;
    this.scene.add(this.plane);
  }

  initAxesHelper() {
    this.axesHelper.name = 'axesHelper';
    this.scene.add(this.axesHelper);
  }

  // 画辅助线（线框）
  drawGridHelper() {
    let gridHelper = new THREE.GridHelper(this.size, this.divisions);
    gridHelper.name = 'gridHelper';
    this.scene.add(gridHelper);
  }

  // 初始化中心方块
  drawCenter() {
    // 红色方块
    // Math.PI = Π =  360°
    this.mouseMesh.rotateX(-Math.PI / 2);
    this.mouseMesh.name = 'mouseCtrl';
    this.scene.add(this.mouseMesh);
  }

  // 画线
  drawLine(points: Array<THREE.Vector3>): THREE.Line {
    let material = new THREE.LineDashedMaterial({
      color: 0x00ffff,
      scale: 0,
    });

    let geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);
    let line = new THREE.Line(geometry, material);
    line.name = Scene.LINE_NAME;
    this.scene.add(line);
    this.render();
    return line;
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  loadGltf(gltfFilePath: string) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/src/static/js/draco/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    this.gltfLoader.setDRACOLoader(dracoLoader);
    this.gltfLoader.load(gltfFilePath, (gltf) => {
      let root = gltf.scene;
      root.position.set(0, 0, 0);
      root.scale.set(1, 1, 1);
      root.rotation.y = Math.PI;
      this.scene.add(root);
    });
  }

  static parseLine(x: number, y: number, z: number): THREE.Vector3 {
    return new THREE.Vector3(x, y, z);
  }
}
