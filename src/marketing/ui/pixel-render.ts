/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  ACESFilmicToneMapping,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  PMREMGenerator,
  SRGBColorSpace,
  Scene,
  TextureLoader,
  WebGLRenderer,
  type Group,
  type Texture,
} from 'three';
import {type PixelFinish} from '../domain/pixel.js';
import {createPixelModel, createStudio} from './pixel-model.js';

/**
 * One picture of the Pixel for <mnw-device-frame>: the phone at a pose, drawn
 * over a rectangle centred on the phone. Lengths are CSS pixels.
 */
export interface PixelRenderRequest {
  finish: PixelFinish;
  /** Degrees about the vertical axis; positive turns the right edge away. */
  yaw: number;
  /** Degrees about the horizontal axis; positive leans the top edge away. */
  pitch: number;
  /** A white-on-transparent mask drawn on the back, or none. */
  logo?: string;
  /** CSS pixels per millimetre. */
  scale: number;
  /** The CSS perspective distance; 0 draws head on, without perspective. */
  perspective: number;
  /** Half the drawn rectangle's width and height, around the phone's centre. */
  halfWidth: number;
  halfHeight: number;
  /** Device pixels per CSS pixel. */
  ratio: number;
}

// One renderer, environment and model per finish for the whole page: every
// frame showing the same pose shares one picture, and a gallery of phones uses
// a single WebGL context however many cards it has.
let renderer: WebGLRenderer | undefined;
let environment: Texture | undefined;
const models = new Map<string, Promise<Group>>();
const pictures = new Map<string, Promise<string>>();

const setUp = () => {
  if (renderer) return renderer;
  const canvas = document.createElement('canvas');
  renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);
  const studio = createStudio();
  const pmrem = new PMREMGenerator(renderer);
  environment = pmrem.fromScene(studio, 0.02).texture;
  pmrem.dispose();
  studio.traverse((node) => {
    if (node instanceof Mesh) {
      node.geometry.dispose();
      (node.material as {dispose(): void}).dispose();
    }
  });
  return renderer;
};

const modelFor = (finish: PixelFinish, logo?: string) => {
  const key = `${finish}|${logo ?? ''}`;
  let model = models.get(key);
  if (!model) {
    model = (async () => {
      const texture = logo
        ? await new TextureLoader().loadAsync(logo)
        : undefined;
      return createPixelModel({
        finish,
        backDecal: texture ? {texture} : undefined,
      });
    })();
    models.set(key, model);
    // A logo that fails to load is tried again next time.
    model.catch(() => models.delete(key));
  }
  return model;
};

const draw = async (request: PixelRenderRequest) => {
  const gl = setUp();
  const model = await modelFor(request.finish, request.logo);
  const {halfWidth: w, halfHeight: h, scale, perspective} = request;
  const scene = new Scene();
  scene.environment = environment!;
  model.scale.setScalar(scale);
  // CSS turns the screen with rotateX(pitch) rotateY(yaw): its y axis points
  // down, so the same turn about three's x axis goes the other way.
  model.rotation.set(
    (-request.pitch * Math.PI) / 180,
    (request.yaw * Math.PI) / 180,
    0,
    'XYZ'
  );
  scene.add(model);
  // The camera sits where CSS puts the viewer: `perspective` pixels in front
  // of the phone's centre, so the picture and the screen laid over it agree.
  const camera = perspective
    ? new PerspectiveCamera(
        (2 * Math.atan(h / perspective) * 180) / Math.PI,
        w / h,
        perspective / 20,
        perspective * 4
      )
    : new OrthographicCamera(-w, w, h, -h, -2000, 2000);
  camera.position.set(0, 0, perspective || 1000);
  camera.lookAt(0, 0, 0);
  gl.setPixelRatio(request.ratio);
  gl.setSize(2 * w, 2 * h, false);
  gl.render(scene, camera);
  scene.remove(model);
  return gl.domElement.toDataURL('image/png');
};

/**
 * The phone drawn for a request, as an image URL. Requests that match share
 * one picture. Rejects where WebGL is unavailable.
 */
export const renderPixel = (request: PixelRenderRequest): Promise<string> => {
  const key = JSON.stringify(request);
  let picture = pictures.get(key);
  if (!picture) {
    picture = draw(request);
    pictures.set(key, picture);
  }
  return picture;
};
