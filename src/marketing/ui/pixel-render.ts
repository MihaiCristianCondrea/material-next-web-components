/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  ACESFilmicToneMapping,
  Mesh,
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
  /** The CSS perspective distance. */
  perspective: number;
  /** How far the phone's centre sits behind the screen's plane, so the display's face is at z = 0. */
  depth: number;
  /** Half the drawn rectangle's width and height, around the phone's centre. */
  halfWidth: number;
  halfHeight: number;
  /** Device pixels per CSS pixel. */
  ratio: number;
}

// One renderer, environment and model per finish for the whole page: a gallery
// of phones uses a single WebGL context however many cards it has.
let renderer: WebGLRenderer | undefined;
let environment: Texture | undefined;
const scene = new Scene();
const camera = new PerspectiveCamera();
const models = new Map<string, Promise<Group>>();
const ready = new Map<string, Group>();

const setUp = () => {
  if (renderer) return renderer;
  renderer = new WebGLRenderer({
    canvas: document.createElement('canvas'),
    alpha: true,
    antialias: true,
    // The frames copy from this canvas after drawing, in the same task.
    preserveDrawingBuffer: true,
    powerPreference: 'low-power',
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
  scene.environment = environment;
  return renderer;
};

const modelKey = (finish: PixelFinish, logo?: string) =>
  `${finish}|${logo ?? ''}`;

/**
 * Loads what a request needs (the renderer, the finish's model and its logo)
 * once. Rejects where WebGL is unavailable.
 */
export const preparePixel = (finish: PixelFinish, logo?: string) => {
  const key = modelKey(finish, logo);
  let model = models.get(key);
  if (!model) {
    model = (async () => {
      setUp();
      const texture = logo
        ? await new TextureLoader().loadAsync(logo)
        : undefined;
      const group = createPixelModel({
        finish,
        backDecal: texture ? {texture} : undefined,
      });
      ready.set(key, group);
      return group;
    })();
    models.set(key, model);
    // A logo that fails to load is tried again next time.
    model.catch(() => models.delete(key));
  }
  return model;
};

/** Draws the request into the shared canvas; the model must be prepared. */
const draw = (request: PixelRenderRequest, model: Group) => {
  const gl = renderer!;
  const {halfWidth: w, halfHeight: h, perspective} = request;
  model.scale.setScalar(request.scale);
  // CSS turns the screen with translateZ(-depth) rotateX(pitch) rotateY(yaw):
  // its y axis points down, so the same turn about three's x axis goes the
  // other way.
  model.rotation.set(
    (-request.pitch * Math.PI) / 180,
    (request.yaw * Math.PI) / 180,
    0,
    'XYZ'
  );
  model.position.set(0, 0, -request.depth);
  scene.add(model);
  // The camera sits where CSS puts the viewer: `perspective` pixels in front
  // of the screen's plane, so the picture and the screen laid over it agree.
  camera.fov = (2 * Math.atan(h / perspective) * 180) / Math.PI;
  camera.aspect = w / h;
  camera.near = perspective / 20;
  camera.far = perspective * 4;
  camera.position.set(0, 0, perspective);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  gl.setPixelRatio(request.ratio);
  gl.setSize(2 * w, 2 * h, false);
  gl.render(scene, camera);
  scene.remove(model);
  return gl.domElement;
};

/**
 * Draws a moving phone straight into `target`, a 2D canvas, without encoding
 * a picture: for poses that change every frame. Returns false until the
 * request's model is prepared.
 */
export const drawPixel = (
  request: PixelRenderRequest,
  target: HTMLCanvasElement
): boolean => {
  const model = ready.get(modelKey(request.finish, request.logo));
  if (!model) return false;
  const source = draw(request, model);
  if (target.width !== source.width || target.height !== source.height) {
    target.width = source.width;
    target.height = source.height;
  }
  const context = target.getContext('2d')!;
  context.clearRect(0, 0, target.width, target.height);
  context.drawImage(source, 0, 0);
  return true;
};

// The still pictures, newest last. Each is a PNG data URL every frame showing
// that pose shares, so the browser decodes it once; the oldest are dropped. A
// data URL, not a blob URL: capture tools that wait for the network to go idle
// never see a blob image's load finish.
const PICTURES_KEPT = 12;
const pictures = new Map<string, Promise<string>>();

const remember = (key: string, picture: Promise<string>) => {
  pictures.set(key, picture);
  while (pictures.size > PICTURES_KEPT) {
    pictures.delete(pictures.keys().next().value!);
  }
};

/**
 * The phone drawn for a request, as an image URL. Requests that match share
 * one picture. Rejects where WebGL is unavailable.
 */
export const renderPixel = (request: PixelRenderRequest): Promise<string> => {
  const key = JSON.stringify(request);
  const cached = pictures.get(key);
  if (cached) {
    // Most recently used: move it to the end.
    pictures.delete(key);
    pictures.set(key, cached);
    return cached;
  }
  const picture = preparePixel(request.finish, request.logo).then(
    (model) =>
      new Promise<string>((resolve, reject) =>
        // toBlob encodes off the main thread, unlike toDataURL.
        draw(request, model).toBlob((blob) => {
          if (!blob) return reject(new Error('no picture'));
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(blob);
        }, 'image/png')
      )
  );
  remember(key, picture);
  picture.catch(() => pictures.delete(key));
  return picture;
};
