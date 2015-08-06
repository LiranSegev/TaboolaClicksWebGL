/**
 * dat.globe Javascript WebGL Globe Toolkit
 * http://dataarts.github.com/dat.globe
 *
 * Copyright 2011 Data Arts Team, Google Creative Lab
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 var DAT = DAT || {};

 DAT.Globe = function(container, opts) {
  opts = opts || {};
  var camera; 
  var scene; 
  var renderer;
  var windowrWidth, windowHeight;
  var earthSphere;
  var earthShineRing;

  var curZoomSpeed = 0;
  var zoomSpeed = 50;

  var rotation = { x: 0, y: 0 },
  target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
  targetOnDown = { x: 0, y: 0 };

  var distance = 10000000, distanceTarget = 100000;
  var padding = 40;
  var PI_HALF = Math.PI / 2;

  function  init()
  {

    var shader, uniforms, material;
    windowrWidth = container.offsetWidth || window.innerWidth;
    windowHeight = container.offsetHeight || window.innerHeight;

    camera = new THREE.PerspectiveCamera(30, windowrWidth / windowHeight, 1, 10000);
    camera.position.z = distance;

    scene = new THREE.Scene();

    var sphereGeometry = new THREE.SphereGeometry(200, 40, 30);

    shader = Shaders['earth'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['texture'].value = THREE.ImageUtils.loadTexture('world.jpg');

    var earthMaterial = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader

    });

    var earthSphere = new THREE.Mesh(sphereGeometry, earthMaterial);
    earthSphere.rotation.y = Math.PI;
    scene.add(earthSphere);
    shader = Shaders['atmosphere'];
    uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    var shineRingMaterial = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true

    });

    earthShineRing = new THREE.Mesh(sphereGeometry, shineRingMaterial);
    earthShineRing.scale.set( 1.05, 1.05, 1.05 );
    scene.add(earthShineRing);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(windowrWidth, windowHeight);
    renderer.setClearColor(0xd3dfe1, 1);
    renderer.domElement.style.position = 'absolute';
    container.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
  }

  var Shaders = {
    'earth' : {
      uniforms: {
        'texture': { type: 't', value: null }
      },
      vertexShader: [
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      'vNormal = normalize( normalMatrix * normal );',
      'vUv = uv;',
      '}'
      ].join('\n'),
      fragmentShader: [
      'uniform sampler2D texture;',
      'varying vec3 vNormal;',
      'varying vec2 vUv;',
      'void main() {',
      'vec3 diffuse = texture2D( texture, vUv ).xyz;',
      'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
      'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
      'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
      '}'
      ].join('\n')
    },
    'atmosphere' : {
      uniforms: {},
      vertexShader: [
      'varying vec3 vNormal;',
      'void main() {',
      'vNormal = normalize( normalMatrix * normal );',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
      '}'
      ].join('\n'),
      fragmentShader: [
      'varying vec3 vNormal;',
      'void main() {',
      'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
      'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
      '}'
      ].join('\n')
    }
  };

  function onWindowResize( event )
  {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }

  function zoom(delta) 
  {

    distanceTarget -= delta;
    distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
    distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
  }

  this.animate = function animate() 
  {
    requestAnimationFrame(animate);
    render();
  }

  function render() 
  {
    zoom(curZoomSpeed);

    rotation.x +=0.005;
    distance += (distanceTarget - distance) * 0.3;
    camera.position.x = distance * Math.sin(rotation.x) * Math.cos(rotation.y);
    camera.position.y = distance * Math.sin(rotation.y);
    camera.position.z = distance * Math.cos(rotation.x) * Math.cos(rotation.y);

    camera.lookAt(earthShineRing.position);

    renderer.render(scene, camera);
  }


// DAT.Globe.prototype.latLonToVector3 = function (lat, lon, height) {
  function latLonToVector3 (lat, lon, height) 
  {
    var vector3 = new THREE.Vector3(0, 0, 0);
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lon) * Math.PI / 180;

    vector3.x = 200 * Math.sin(phi) * Math.cos(theta);
    vector3.y = 200 * Math.cos(phi);
    vector3.z = 200 * Math.sin(phi) * Math.sin(theta);

    return vector3;
  }

  var circleGeometry = new THREE.BoxGeometry( 1.5,1.5, 1.5 );

  this.AddClick = function (click) 
  {
   var material = new THREE.MeshBasicMaterial({
    color : 0x0082f9,
    transparent: true,
    opacity: 1
  });

   var position = latLonToVector3(parseInt(click.latitude),parseInt(click.longitude),0);
   var circle = new THREE.Mesh( circleGeometry, material );

   circle.position.x = position.x;  
   circle.position.y = position.y;
   circle.position.z = position.z;
   circle.lookAt(globe.scene.position);

   globe.scene.add(circle);

   TweenLite.to(circle.material,5, {
    opacity: 0,
    ease: Quad.easeOut,
    onComplete:RemoveFromScene,
    onCompleteParams:[circle]
  });


 }
 function RemoveFromScene(circle)
 {
  globe.scene.remove(circle);
}

init();
this.renderer = renderer;
this.scene = scene;
this.latLonToVector3 = latLonToVector3;
return this;

};

