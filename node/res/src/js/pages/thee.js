import * as THREE from 'three';


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.set( 0, 0, 100 );
// camera.lookAt( 0, 0, 0 );

const scene = new THREE.Scene();

const geometryBox = new THREE.BoxGeometry(1, 1, 1);
const materia = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
const cube = new THREE.Mesh( geometryBox, materia );
cube.position.x = 1;

const cube1 = new THREE.Mesh( geometryBox, materia );

cube1.position.x = -1;

const points = [];
points.push( new THREE.Vector3( -1.2, 0.8, 0.1 ) );
points.push( new THREE.Vector3( 1.2, 0.8, 0.1 ) );
points.push( new THREE.Vector3( 1.2, -0.8, 0.1 ) );
points.push( new THREE.Vector3( -1.2, -0.8, 0.1 ) );
points.push( new THREE.Vector3( -1.2, 0.8, 0.1 ) );

const geometrySphere = new THREE.SphereGeometry(0.02);


const sphere = new THREE.Mesh(geometrySphere, materia);
// points.push( new THREE.Vector3( 0, 10, 0 ) );
// points.push( new THREE.Vector3( 10, 0, 0 ) );
// points.push( new THREE.Vector3( 0, -10, 0 ) );
// points.push( new THREE.Vector3( - 10, 0, 0 ) );


const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, materia );
scene.add(cube);
scene.add(cube1);
scene.add(line);
scene.add(sphere);

camera.position.z = 5;

let ballDirX = Math.floor(Math.random() * 2) == 0 ? -1: 1;
let ballDirY = Math.floor(Math.random() * 2) == 0 ? -1: 1;
function resetGame()
{
    ballDirX = Math.floor(Math.random() * 2) == 0 ? -1: 1;
    ballDirY = Math.floor(Math.random() * 2) == 0 ? -1: 1;
    sphere.position.x = 0
    sphere.position.y = 0
    cube.position.y = 0
    cube1.position.y = 0
}

let keys = {}

let scoreR = 0;
let scoreL = 0;

let speed = 0.01;

document.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function animate() {
	renderer.render( scene, camera );

    if (keys['s'] && cube1.position.y - 0.2 > -0.8)
        cube1.position.y -= 0.02;

    if (keys['w'] && cube1.position.y + 0.2 < 0.8)
        cube1.position.y += 0.02;

    if (keys['k']  && cube.position.y - 0.2 > -0.8)
        cube.position.y -= 0.02;

    if (keys['i'] && cube.position.y + 0.2< 0.8)
        cube.position.y += 0.02;

    if (sphere.position.x >= 1.2 || sphere.position.x <= -1.2)
    {
        if (sphere.position.x >= 1.2)
            scoreR++;
        else
            scoreL++;
        if (scoreL  == 2)
            alert("WINER LEFT PLAYER")
        else if (scoreR  == 2)
            alert("WINER RIGHT PLAYER")
        resetGame()
    }
    if (sphere.position.x <= -1 + 0.03 && sphere.position.y <= cube1.position.y + 0.2 && sphere.position.y >= cube1.position.y - 0.2)
    {
        speed += 0.001;
        ballDirX *= -1;
    }
    if (sphere.position.x >= 1 - 0.03 && sphere.position.y <= cube.position.y + 0.2 && sphere.position.y >= cube.position.y - 0.2)
    {
        speed += 0.001;
        ballDirX *= -1
    }
    if (sphere.position.y >= 0.8 || sphere.position.y <= -0.8)
        ballDirY *= -1
    sphere.position.x += speed * ballDirX
    sphere.position.y += speed * ballDirY
    // cube.rotation.x += 0.01
    // cube.rotation.y += 0.01
    // cube1.rotation.x += 0.01
    // cube1.rotation.y += 0.01
}
renderer.setAnimationLoop( animate );