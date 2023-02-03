import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

interface GLTFModel {
  modelId: string;

  modelName: string;

  modelImgUrl: string;

  modelUrl: string;

  sizeX: number;

  sizeY: number;

  sizeZ: number;
}

export {
  THREE,
  FBXLoader,
  GLTFLoader,
  DRACOLoader,
  OrbitControls,
  TransformControls,
};
