import * as THREE from "three";

export const CONFIG = {
  colors: {
    background: 0xf0f0f0,
    grey: 0xa9a9a9,
    pinGreen: 0x00ff00,
    pinYellow: 0xffff00,
    ambientLight: 0xf0f0f0,
    directionalLight: 0xf0f0f0,
    mapPlaneBackground: 0xffffff,
  },
  mapPlane: {
    width: 1000,
    height: 700,
    backgroundZ: -386.3,
    scale: 0.1,
    scaleY: -1,
    positionZ: 0,
    correction: {
      x: -167.6,
      y: 21.5,
      z: 375.9,
    },
    planeRotationX: 0,
    planePositionZ: -385.8,
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
  },
  camera: {
    fov: 75,
    near: 0.1,
    far: 10000,
  },
  // Positions des continents
  continents: {
    europe: {
      camera: new THREE.Vector3(-5, 5, 50),
      target: new THREE.Vector3(-5, 5, -9.5),
    },
    amérique: {
      camera: new THREE.Vector3(-100, 5, 50),
      target: new THREE.Vector3(-100, 5, -9.5),
    },
    océan: {
      camera: new THREE.Vector3(50, -30, 50),
      target: new THREE.Vector3(50, -30, -9.5),
    },
  },
  controls: {
    minDistance: 0,
    map: {
      continent: {
        maxDistance: 65,
        minDistance: 50,
        minPolarAngle: Math.PI / 12,
        maxPolarAngle: Math.PI / 12,
        minAzimuthAngle: 0,
        maxAzimuthAngle: 0,
      },
      city: {
        maxDistance: 5,
        minDistance: 4,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI / 3,
        minAzimuthAngle: -0.05,
        maxAzimuthAngle: 0.05,
      },
      museum: {
        maxDistance: 3,
        minDistance: 0.4,
        defaultDistance: 0.4,
        minPolarAngle: 0,
        maxPolarAngle: Math.PI / 3,
        minAzimuthAngle: -Infinity,
        maxAzimuthAngle: Infinity,
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
