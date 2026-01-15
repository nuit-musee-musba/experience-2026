import * as THREE from "three";

export const CONFIG = {
  colors: {
    background: 0xf0f0f0,
    grey: 0xa9a9a9,
    pinGreen: 0x00ff00,
    pinYellow: 0xffff00,
    ambientLight: 0xf0f0f0,
    directionalLight: 0xf0f0f0,
    mapPlaneBackground: 0xf0f0f0,
  },
  mapPlane: {
    width: 1000,
    height: 700,
    backgroundZ: -10,
    scaleY: -1,
    positionZ: 0,
    correction: {
      x: 0,
      y: 0,
      z: 0,
    },
    planeRotationX: 0,
    planePositionZ: -10,
    scale: 10,
  },
  pins: {
    circleTextureSize: 64,
    circleRadius: 28,
    defaultZ: -9.5,
    onceClickedZ: -10,
    artworks: {
      geometrySizes: [1, 1, 1],
      travelOffsetY: -2,
    },
    museums: {
      sphereRadius: 1,
      sphereWidthSegments: 32,
      sphereHeightSegments: 16,
      hoverOffsetY: 0,
      hoverZ: 6,
    },
    travelDestinationZ: -9,
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 10000,
    initialPosition: new THREE.Vector3(0, 0, 0),
    homePosition: new THREE.Vector3(-5, 5, 50),
    zoomLerpFactor: 0.05,
    museumView: {
      diveAngle: Math.PI / 3,
      distance: 7,
    },
  },
  controls: {
    dampingFactor: 0.05,
    minDistance: 0,
    map: {
      maxDistance: 130,
      minPolarAngle: 0,
      maxPolarAngle: Math.PI,
      minAzimuthAngle: -0.05,
      maxAzimuthAngle: 0.05,
      steps: {
        0: {
          minDistance: 30,
          maxDistance: 60,
          minPolarAngle: 0,
          maxPolarAngle: 0,
        },
        1: {
          minDistance: 30,
          maxDistance: 50,
          minPolarAngle: 0,
          maxPolarAngle: 0,
        },
        2: {
          minDistance: 4,
          maxDistance: 12,
          minPolarAngle: Math.PI / 3,
          maxPolarAngle: Math.PI / 2,
        },
      },
    },
    orbit: {},
  },
  lights: {
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    directionalPosition: new THREE.Vector3(5, 5, 5),
  },
  axesHelperSize: 500,
};
