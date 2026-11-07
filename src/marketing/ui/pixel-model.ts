/**
 * @license
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {
  BackSide,
  BoxGeometry,
  BufferGeometry,
  CircleGeometry,
  Color,
  DataTexture,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Path,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  Texture,
  Vector2,
} from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {
  PIXEL_9_PRO_XL,
  PIXEL_FINISHES,
  type PixelFinish,
} from '../domain/pixel.js';

export {PIXEL_9_PRO_XL, type PixelFinish};

/** Options for {@link createPixelModel}. */
export interface PixelModelOptions {
  /** The colourway. Defaults to `obsidian`. */
  finish?: PixelFinish;
  /**
   * A mark on the back glass, centred where the Pixel carries its logo. None by default: the model
   * ships without any brand. A host that may show one passes the mark's shape, and the model
   * draws it the way the Pixel does: in the back's own colour, polished where the rest is matte,
   * so it suits every finish.
   */
  backDecal?: BackDecal;
}

/** A mark on the back glass for {@link PixelModelOptions.backDecal}. */
export interface BackDecal {
  /**
   * The mark's shape as a mask: white where the mark is, black or transparent elsewhere, filling
   * a square texture. The model does not dispose it.
   */
  texture: Texture;
  /** The square's width and height on the back, in millimetres. Defaults to 12.7, the Pixel's logo. */
  size?: number;
}

/**
 * A Pixel 9 Pro XL, standing up, the display facing +Z, centred on the origin, in millimetres.
 * It carries no logo unless the host passes one as `backDecal`.
 * The display is a mesh named `Display` (dark glass), so a live screen can be laid over it.
 * Every geometry and material belongs to the group: dispose them with it.
 */
export function createPixelModel({
  finish = 'obsidian',
  backDecal,
}: PixelModelOptions = {}): Group {
  const spec = PIXEL_9_PRO_XL;
  const colours = PIXEL_FINISHES[finish];
  const phone = new Group();
  phone.name = 'Pixel 9 Pro XL';

  const metal = new MeshPhysicalMaterial({
    color: colours.frame,
    metalness: 1,
    roughness: 0.12,
  });
  // The camera bar is bead-blasted: a fine grain that scatters the light evenly.
  const grain = satinGrain();
  const barMetal = new MeshPhysicalMaterial({
    color: colours.bar,
    metalness: 0,
    roughness: 0.7,
    roughnessMap: grain,
  });
  // Its side walls are polished and darker, so they read as a dark band around the bar.
  const barSide = new MeshPhysicalMaterial({
    color: colours.side,
    metalness: 1,
    roughness: 0.3,
  });
  const backGlass = new MeshPhysicalMaterial({
    color: colours.back,
    metalness: 0,
    roughness: 0.75,
    clearcoat: 0.15,
    clearcoatRoughness: 0.7,
  });
  // The bezel's glass: black, with a soft reflection, so it stays a dark rim around the screen
  // at an angle instead of mirroring the studio's lights.
  const frontGlass = new MeshPhysicalMaterial({
    color: 0x050608,
    roughness: 0.25,
    specularIntensity: 0.12,
  });
  const display = new MeshPhysicalMaterial({
    color: 0x07090d,
    roughness: 0.08,
    clearcoat: 1,
  });
  const darkGlass = new MeshPhysicalMaterial({
    color: 0x0c0d10,
    roughness: 0.1,
    clearcoat: 1,
  });
  // The cameras' window: deep, glossy black glass.
  const windowGlass = new MeshPhysicalMaterial({
    color: 0x070708,
    roughness: 0.05,
    specularIntensity: 0.12,
  });
  // Inside the window, the parts behind the glass are only a shade lighter than it.
  const shade = (color: number) =>
    new MeshPhysicalMaterial({color, roughness: 0.35, specularIntensity: 0.12});
  const barrel = shade(0x08080a);
  const surround = shade(0x0f0f11);
  const faint = shade(0x0f0f11);
  const rim = new MeshPhysicalMaterial({
    color: 0x101113,
    metalness: 1,
    roughness: 0.32,
    side: DoubleSide,
  });
  // The cover glass over the whole window, reflecting the room over the parts beneath it.
  const cover = new MeshPhysicalMaterial({
    color: 0x000000,
    roughness: 0.04,
    clearcoat: 1,
    transparent: true,
    opacity: 0.08,
    depthWrite: false,
  });
  // Coated lens glass: near black, glowing purple and blue towards the rim, under a clear cap
  // that catches the highlights.
  const coating = lensCoating();
  const lensGlass = new MeshPhysicalMaterial({
    map: coating,
    emissive: 0xffffff,
    emissiveMap: coating,
    emissiveIntensity: 0.2,
    roughness: 0.4,
    specularIntensity: 0.3,
  });
  // The periscope's glass sits deeper and glows less.
  const telephotoGlass = lensGlass.clone();
  telephotoGlass.emissiveIntensity = 0.1;
  telephotoGlass.color.setScalar(0.6);
  const lensCap = new MeshPhysicalMaterial({
    color: 0x000000,
    roughness: 0.02,
    clearcoat: 1,
    transparent: true,
    opacity: 0.15,
  });
  const antenna = new MeshPhysicalMaterial({
    color: 0x1b1c1f,
    metalness: 0.4,
    roughness: 0.5,
  });
  const black = new MeshPhysicalMaterial({color: 0x020203, roughness: 0.7});
  const diffuser = new MeshPhysicalMaterial({
    color: 0xf1f0ec,
    roughness: 0.3,
    clearcoat: 0.6,
  });
  const diffuserRing = new MeshPhysicalMaterial({
    color: 0xd9d7d0,
    roughness: 0.3,
    clearcoat: 0.6,
  });
  const led = new MeshPhysicalMaterial({
    color: 0xe6d49a,
    emissive: 0x3a3214,
    roughness: 0.4,
  });
  // The temperature sensor: a glossy black lens in a thin grey ring.
  const sensorRim = new MeshPhysicalMaterial({
    color: 0x6a6b6e,
    metalness: 0.6,
    roughness: 0.35,
  });
  const sensorGlass = new MeshPhysicalMaterial({
    color: 0x343437,
    roughness: 0.35,
    clearcoat: 0.5,
  });

  const add = (name: string, geometry: BufferGeometry, material: Material) => {
    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    phone.add(mesh);
    return mesh;
  };

  // The body: a rounded slab whose softened edges are the aluminium frame.
  const e = spec.edgeRadius;
  const body = new ExtrudeGeometry(
    roundedRect(spec.width - 2 * e, spec.height - 2 * e, spec.cornerRadius - e),
    {
      depth: spec.depth - 2 * e,
      bevelEnabled: true,
      bevelThickness: e,
      bevelSize: e,
      bevelSegments: 8,
      curveSegments: 32,
    }
  );
  body.translate(0, 0, -(spec.depth - 2 * e) / 2);
  add('Frame', body, metal);

  // Glass front and back, on the flat faces inside the frame's soft edge.
  const face = roundedRect(
    spec.width - 2 * e,
    spec.height - 2 * e,
    spec.cornerRadius - e
  );
  const front = new ShapeGeometry(face, 32);
  front.translate(0, 0, spec.depth / 2 + 0.05);
  add('Front glass', front, frontGlass);
  const back = new ShapeGeometry(face, 32);
  back.rotateY(Math.PI);
  back.translate(0, 0, -spec.depth / 2 - 0.05);
  add('Back glass', back, backGlass);
  if (backDecal) {
    // Polished into the matte glass a little below the centre of the back, in the back's colour.
    const size = backDecal.size ?? BACK_DECAL_MM;
    const decal = new PlaneGeometry(size, size);
    decal.rotateY(Math.PI);
    decal.translate(0, -BACK_DECAL_DROP, -spec.depth / 2 - 0.08);
    const print = new MeshPhysicalMaterial({
      // A shade deeper than the back, so the mark shows on the light finishes too.
      color: new Color(colours.back).multiplyScalar(0.8),
      alphaMap: backDecal.texture,
      transparent: true,
      roughness: 0.5,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      depthWrite: false,
    });
    add('Back decal', decal, print);
  }

  // The display and its hole-punch camera.
  const panel = new ShapeGeometry(
    roundedRect(
      spec.display.width,
      spec.display.height,
      spec.display.cornerRadius
    ),
    32
  );
  panel.translate(0, 0, spec.depth / 2 + 0.1);
  add('Display', panel, display);
  const cameraY = spec.height / 2 - spec.frontCamera.fromTop;
  add(
    'Front camera ring',
    disc(spec.frontCamera.ring / 2, spec.depth / 2 + 0.12, 0, cameraY),
    darkGlass
  );
  add(
    'Front camera',
    disc(spec.frontCamera.diameter / 2, spec.depth / 2 + 0.15, 0, cameraY),
    black
  );

  // The camera bar: satin metal with a flat top and a fine chamfer, holding the recessed window
  // with the three cameras, and the flash and the temperature sensor on the metal beside it.
  const v = spec.visor;
  const c = spec.cameras;
  const visorY = spec.height / 2 - v.fromTop - v.height / 2;
  const windowX = (c.window.left + c.window.right) / 2;
  const windowWidth = c.window.left - c.window.right;
  const windowHeight = v.height - 2 * c.window.inset;
  // The bar is a ring of metal around the window: the hole is cut wider by the chamfer, which
  // narrows it back to the window's size. Turned to face the back, its x runs the other way.
  const barShape = stadium(v.width - 2 * v.edge, v.height - 2 * v.edge);
  barShape.holes.push(
    stadiumPath(windowWidth + 2 * v.edge, windowHeight + 2 * v.edge, -windowX)
  );
  const visor = new ExtrudeGeometry(barShape, {
    depth: v.raise - 2 * v.edge,
    bevelEnabled: true,
    bevelThickness: v.edge,
    bevelSize: v.edge,
    bevelSegments: 4,
    curveSegments: 64,
  });
  visor.rotateY(Math.PI);
  visor.translate(0, visorY, -spec.depth / 2 - v.edge);
  // An extrusion's first group is its flat faces, the second its walls and chamfers.
  phone.add(
    Object.assign(new Mesh(visor, [barMetal, barSide]), {name: 'Camera bar'})
  );

  // The bar's soft shadow on the back glass, falling a little below it.
  const blur = 3.2;
  const shadow = new PlaneGeometry(v.width + 2 * blur, v.height + 2 * blur);
  shadow.rotateY(Math.PI);
  shadow.translate(0, visorY - 0.8, -spec.depth / 2 - 0.06);
  const shadowMaterial = new MeshBasicMaterial({
    color: 0x000000,
    alphaMap: softShadow(v.width, v.height, blur),
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  add('Camera bar shadow', shadow, shadowMaterial);

  // Seen from the back, the model's +X is on the left. `at` places a part on the bar's top face,
  // `lift` millimetres above the one under it; `inside` places it in the window, `lift` above the
  // window's floor.
  const top = -spec.depth / 2 - v.raise;
  const at = (
    geometry: BufferGeometry,
    x: number,
    up: number,
    lift: number
  ) => {
    geometry.rotateY(Math.PI);
    geometry.translate(x, visorY + up, top - lift);
    return geometry;
  };
  const inside = (
    geometry: BufferGeometry,
    x: number,
    up: number,
    lift: number
  ) => at(geometry, x, up, lift - c.window.depth);
  // The window's floor sits a little wider than the opening, under the metal, so no gap shows.
  add(
    'Camera window',
    inside(
      new ShapeGeometry(stadium(windowWidth + 0.6, windowHeight + 0.6), 64),
      windowX,
      0,
      0.02
    ),
    windowGlass
  );
  add(
    'Camera window glass',
    inside(
      new ShapeGeometry(stadium(windowWidth, windowHeight), 64),
      windowX,
      0,
      0.6
    ),
    cover
  );

  // A lens: a dark barrel, a metal funnel rising from it to the glass, which catches the light
  // as a grey ring, and the coated glass under a clear dome.
  const lens = (
    name: string,
    x: number,
    barrelSize: number,
    glassSize: number
  ) => {
    const inner = glassSize / 2 + 0.35;
    const outer = inner + (barrelSize / 2 - inner) * 0.95;
    add(`${name} barrel`, inside(circle(barrelSize / 2), x, 0, 0.06), barrel);
    add(
      `${name} funnel`,
      inside(funnel(outer, 0.07, inner, LENS_RISE), x, 0, 0),
      rim
    );
    add(
      name,
      inside(
        lensFace(roundedRect(glassSize, glassSize, glassSize / 2)),
        x,
        0,
        LENS_RISE + 0.01
      ),
      lensGlass
    );
    add(
      `${name} cap`,
      inside(dome(glassSize / 2, 0.05), x, 0, LENS_RISE + 0.02),
      lensCap
    );
  };
  lens(
    'Ultrawide camera',
    c.ultrawide.x,
    c.ultrawide.barrel,
    c.ultrawide.glass
  );
  add(
    'Main camera halo',
    inside(ring(c.main.halo / 2, c.main.halo / 2 - 0.4), c.main.x, 0, 0.06),
    faint
  );
  lens('Main camera', c.main.x, c.main.barrel, c.main.glass);
  // The telephoto looks through a periscope: a tall glass window in a rounded surround.
  const [sw, sh, sr] = c.telephoto.surround;
  const [gw, gh, gr] = c.telephoto.glass;
  add(
    'Telephoto surround',
    inside(
      new ShapeGeometry(roundedRect(sw, sh, sr), 16),
      c.telephoto.x,
      0,
      0.06
    ),
    surround
  );
  add(
    'Telephoto rim',
    inside(
      new ShapeGeometry(roundedRect(gw + 0.5, gh + 0.5, gr + 0.25), 16),
      c.telephoto.x,
      0,
      0.08
    ),
    rim
  );
  add(
    'Telephoto camera',
    inside(lensFace(roundedRect(gw, gh, gr)), c.telephoto.x, 0, 0.1),
    telephotoGlass
  );
  add(
    'Spectral sensor',
    inside(
      new ShapeGeometry(roundedRect(c.spectral.size, c.spectral.size, 0.15), 4),
      c.spectral.x,
      c.spectral.up,
      0.06
    ),
    faint
  );
  add(
    'Back microphone',
    inside(
      circle(c.microphone.diameter / 2),
      c.microphone.x,
      c.microphone.up,
      0.06
    ),
    barrel
  );
  for (const x of c.autofocus.x) {
    add(
      'Autofocus window',
      inside(circle(c.autofocus.diameter / 2), x, c.autofocus.up, 0.06),
      faint
    );
  }
  add(
    'Flash',
    at(circle(c.flash.diameter / 2), c.flash.x, c.flash.up, 0.02),
    diffuser
  );
  add(
    'Flash ring',
    at(
      ring(c.flash.diameter * 0.36, c.flash.diameter * 0.3),
      c.flash.x,
      c.flash.up,
      0.04
    ),
    diffuserRing
  );
  add(
    'Flash LED',
    at(circle(c.flash.led / 2), c.flash.x, c.flash.up, 0.05),
    led
  );
  add(
    'Sensor rim',
    at(circle(c.sensor.diameter / 2), c.sensor.x, c.sensor.up, 0.02),
    sensorRim
  );
  add(
    'Sensor',
    at(circle(c.sensor.diameter / 2 - 0.3), c.sensor.x, c.sensor.up, 0.04),
    sensorGlass
  );

  // Power and volume on the right edge, the power key above.
  const k = spec.keys;
  for (const [name, key] of [
    ['Power key', k.power],
    ['Volume keys', k.volume],
  ] as const) {
    // A pill standing proud of the flat side, its edges rounded, in a thin dark seam.
    const y = spec.height / 2 - key.fromTop - key.length / 2;
    const bevel = 0.25;
    const geometry = new ExtrudeGeometry(
      roundedRect(
        KEY_THICKNESS - 2 * bevel,
        key.length - 2 * bevel,
        KEY_THICKNESS / 2 - bevel
      ),
      {
        depth: k.proud,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 4,
        curveSegments: 16,
      }
    );
    // Shape x across the side, y along it; a quarter turn about Y extrudes it out of the side.
    geometry.rotateY(Math.PI / 2);
    geometry.translate(spec.width / 2 - k.proud / 2 - 0.1, y, 0);
    add(name, geometry, metal);
    const seam = new ShapeGeometry(
      roundedRect(
        KEY_THICKNESS + 0.4,
        key.length + 0.4,
        KEY_THICKNESS / 2 + 0.2
      ),
      16
    );
    seam.rotateY(Math.PI / 2);
    seam.translate(spec.width / 2 + 0.01, y, 0);
    add(`${name} seam`, seam, black);
  }

  // USB-C, the speaker and microphone holes, drawn on the flat top and bottom edges.
  const onEdge = (geometry: BufferGeometry, x: number, bottom: boolean) => {
    geometry.rotateX(bottom ? Math.PI / 2 : -Math.PI / 2);
    geometry.translate(x, (bottom ? -1 : 1) * (spec.height / 2 + 0.02), 0);
    return geometry;
  };
  add(
    'USB-C port',
    onEdge(new ShapeGeometry(roundedRect(8.4, 2.6, 1.3), 16), 0, true),
    black
  );
  for (const x of [-18, -15.6, -13.2, -10.8, 10.8, 13.2, 15.6, 18]) {
    add('Speaker hole', onEdge(circle(0.55), x, true), black);
  }
  add('Top microphone', onEdge(circle(0.4), 6.2, false), black);

  // Antenna lines across the frame, near each corner.
  for (const y of [spec.height / 2 - 16, -spec.height / 2 + 16]) {
    for (const x of [-spec.width / 2, spec.width / 2]) {
      const band = new RoundedBoxGeometry(
        0.3,
        1.1,
        spec.depth - 2 * e + 0.2,
        1,
        0.1
      );
      band.translate(x, y, 0);
      add('Antenna line', band, antenna);
    }
  }
  return phone;
}

/**
 * The light the model is tuned under: a dark studio lit by softboxes, the way product photos are
 * taken, so glossy black parts stay black and carry crisp highlights while the satin and matte
 * ones read as greys. The viewer looks from +Z. Turn it into an environment map with
 * `PMREMGenerator.fromScene(createStudio(), 0.02)` and dispose the scene's geometries and
 * materials after.
 */
export function createStudio(): Scene {
  const studio = new Scene();
  studio.add(
    new Mesh(
      new BoxGeometry(10, 10, 10),
      new MeshBasicMaterial({
        color: new Color().setScalar(STUDIO.wall),
        side: BackSide,
      })
    )
  );
  const panel = (
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    power: number,
    round = false
  ) => {
    const light = new Mesh(
      round
        ? new CircleGeometry(width / 2, 48)
        : new PlaneGeometry(width, height),
      new MeshBasicMaterial({color: new Color().setScalar(power), side: 2})
    );
    light.position.set(x, y, z);
    light.lookAt(0, 0, 0);
    studio.add(light);
  };
  panel(6, 4, 0, 4.9, 0, STUDIO.top); // a softbox overhead
  panel(7, 7, -4.9, 0.5, -1, STUDIO.side); // a wide softbox on the left
  panel(9.8, 9.8, 0, 0, 4.9, STUDIO.front); // a dark wall in front, around the viewer
  panel(9.8, 9.8, 0, -4.9, 0, STUDIO.floor); // a dark floor
  // Softboxes high and to the left in front, raking across the phone; the right stays dark.
  panel(5, 2.5, 0, 3.4, 3.4, STUDIO.rake);
  panel(2.5, 5, -3.4, 0.5, 3.4, STUDIO.rake);
  return studio;
}

const STUDIO = {wall: 0.6, top: 5, side: 6, front: 0.03, floor: 0.1, rake: 8};

/** The Pixel's logo on the back, measured from Google's product photos, in millimetres. */
const BACK_DECAL_MM = 12.7;
/** How far the logo's centre sits below the centre of the back, in millimetres. */
const BACK_DECAL_DROP = 0.5;

/** A rectangle with rounded corners, centred on the origin. */
function roundedRect(width: number, height: number, radius: number): Shape {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.absarc(x + width - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - r);
  shape.absarc(x + width - r, y + height - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + height);
  shape.absarc(x + r, y + height - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/** A pill: a rectangle with fully round ends. */
function stadium(width: number, height: number): Shape {
  return roundedRect(width, height, height / 2);
}

/** A pill-shaped hole, centred `x` across. */
function stadiumPath(width: number, height: number, x: number): Path {
  const r = height / 2;
  const path = new Path();
  path.moveTo(x - width / 2 + r, -r);
  path.absarc(x - width / 2 + r, 0, r, -Math.PI / 2, Math.PI / 2, true);
  path.lineTo(x + width / 2 - r, r);
  path.absarc(x + width / 2 - r, 0, r, Math.PI / 2, -Math.PI / 2, true);
  return path;
}

/** A flat disc at depth `z`, facing the front, or the back when `backward`. */
function disc(
  radius: number,
  z: number,
  x: number,
  y: number,
  backward = false
): BufferGeometry {
  const geometry = new ShapeGeometry(
    roundedRect(radius * 2, radius * 2, radius),
    32
  );
  if (backward) geometry.rotateY(Math.PI);
  geometry.translate(x, y, z);
  return geometry;
}

/** A flat disc in the XY plane, centred on the origin. */
function circle(radius: number): BufferGeometry {
  return new ShapeGeometry(roundedRect(radius * 2, radius * 2, radius), 48);
}

/** A flat ring in the XY plane, centred on the origin. */
function ring(outer: number, inner: number): BufferGeometry {
  const shape = roundedRect(outer * 2, outer * 2, outer);
  const hole = new Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return new ShapeGeometry(shape, 48);
}

/**
 * A lens: a shallow glass dome rising towards +Z by `flatness` of its radius, so it catches
 * highlights as the phone turns. `at` turns it to face the back.
 */
function dome(radius: number, flatness: number): BufferGeometry {
  const geometry = new SphereGeometry(
    radius,
    48,
    12,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  );
  geometry.rotateX(Math.PI / 2);
  geometry.scale(1, 1, flatness);
  return geometry;
}

/** How thick the keys are, across the side, in millimetres. */
const KEY_THICKNESS = 2.6;

/** How far each lens's glass stands above the window's floor, in millimetres. */
const LENS_RISE = 0.4;

/**
 * An open cone from a circle of radius `outer` at height `low` to one of radius `inner` at
 * `high`, facing +Z, in the XY plane.
 */
function funnel(
  outer: number,
  low: number,
  inner: number,
  high: number
): BufferGeometry {
  const geometry = new LatheGeometry(
    [new Vector2(outer, low), new Vector2(inner, high)],
    64
  );
  // The lathe turns about Y; a quarter turn about X stands its height along +Z.
  geometry.rotateX(Math.PI / 2);
  // Shade it as a steep cone, the way a lens barrel's bevel catches the light, though it is
  // shallow enough to fit under the window's glass.
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const tilt = (50 * Math.PI) / 180;
  for (let i = 0; i < position.count; i++) {
    const angle = Math.atan2(position.getY(i), position.getX(i));
    normal.setXYZ(
      i,
      Math.cos(angle) * Math.sin(tilt),
      Math.sin(angle) * Math.sin(tilt),
      Math.cos(tilt)
    );
  }
  return geometry;
}

/** A shape as a flat face whose UVs span 0 to 1 across its bounds, for a texture laid over it. */
function lensFace(shape: Shape): BufferGeometry {
  const geometry = new ShapeGeometry(shape, 48);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < position.count; i++) {
    uv.setXY(
      i,
      (position.getX(i) - box.min.x) / (box.max.x - box.min.x),
      (position.getY(i) - box.min.y) / (box.max.y - box.min.y)
    );
  }
  return geometry;
}

/**
 * How coated lens glass looks head on: near black in the middle, warming to violet and blue
 * towards the rim, stronger on one side where the light falls.
 */
function lensCoating(): DataTexture {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x + 0.5) / size - 0.5;
      const dy = (y + 0.5) / size - 0.5;
      const r = Math.min(1, Math.hypot(dx, dy) * 2);
      const angle = Math.atan2(dy, dx);
      // Dark navy glass, teal towards the lower left and violet towards the upper right, both
      // stronger towards the rim, a faint ring of the iris and a blue point in the middle.
      const rim = r ** 2;
      const across = Math.cos(angle - Math.PI / 4);
      const violet = rim * Math.max(0, across) ** 1.5 * 0.75;
      const teal = rim * Math.max(0, -across) ** 1.5 * 0.4;
      const iris = Math.max(0, 1 - Math.abs(r - 0.32) / 0.06) * 0.25;
      const blue = Math.max(0, 1 - r / 0.07) * 0.8;
      const i = (y * size + x) * 4;
      data[i] = (9 + violet * 120 + teal * 35 + iris * 20 + blue * 30) | 0;
      data[i + 1] = (10 + violet * 55 + teal * 95 + iris * 25 + blue * 45) | 0;
      data[i + 2] =
        (24 + violet * 165 + teal * 125 + iris * 70 + blue * 200) | 0;
      data[i + 3] = 255;
    }
  }
  const texture = new DataTexture(data, size, size);
  texture.colorSpace = 'srgb';
  texture.needsUpdate = true;
  return texture;
}

/**
 * A pill's soft shadow as an alpha map for a plane `blur` larger than the pill on every side:
 * solid under the pill, fading to nothing `blur` millimetres beyond its edge.
 */
function softShadow(width: number, height: number, blur: number): DataTexture {
  const w = 256;
  const h = Math.round((w * (height + 2 * blur)) / (width + 2 * blur));
  const data = new Uint8Array(w * h * 4);
  const r = height / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = ((x + 0.5) / w - 0.5) * (width + 2 * blur);
      const py = ((y + 0.5) / h - 0.5) * (height + 2 * blur);
      // Distance outside the pill, zero inside.
      const dx = Math.max(0, Math.abs(px) - (width / 2 - r));
      const outside = Math.max(0, Math.hypot(dx, py) - r);
      const t = Math.max(0, 1 - outside / blur);
      const value = (t * t * (3 - 2 * t) * 255) | 0;
      data.set([value, value, value, 255], (y * w + x) * 4);
    }
  }
  const texture = new DataTexture(data, w, h);
  texture.needsUpdate = true;
  return texture;
}

/**
 * A fine, even grain for bead-blasted metal: a small tile of seeded noise, repeated every
 * 1.6 millimetres (the geometry's UVs are in millimetres), varying the roughness only slightly.
 */
function satinGrain(): DataTexture {
  const size = 256;
  const data = new Uint8Array(size * size * 4);
  let seed = 9;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 16807) % 2147483647;
    const value = (215 + (seed / 2147483647) * 40) | 0;
    data.set([value, value, value, 255], i * 4);
  }
  const texture = new DataTexture(data, size, size);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(1 / 1.6, 1 / 1.6);
  texture.needsUpdate = true;
  return texture;
}
