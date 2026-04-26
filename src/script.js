import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import CANNON, { SAPBroadphase } from 'cannon'
import { rand, shapeCircle } from 'three/tsl'
import { GLTFLoader } from 'three/examples/jsm/Addons.js'

const gltfLoader = new GLTFLoader()
/**
 * Debug
 */
const gui = new GUI()
const customObjects = {}

customObjects.createSphere = ()=>{
    createSphere({ x: (Math.random() - 0.5)*12 , y: 7 , z:(Math.random() - 0.5)*12})
}
customObjects.reset = ()=>{
    
    customObjects.reset = () => {

    for (let i = updateObject.length - 1; i >= 0; i--) {

        const obj = updateObject[i]

        obj.object.removeEventListener('collide', playHitSound)
        world.removeBody(obj.object)
        scene.remove(obj.mesh)

        updateObject.splice(i, 1)
    }
}
}

gui.add(customObjects,'createSphere')
gui.add(customObjects,'reset')

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

const hitSound = new Audio('/sounds/tunetank.com_duck-horn-quack-catcall.wav');
// const hitSound2 = new Audio('/sounds/tunetank.com_quack-cartoon-duck.wav'); 

const sounds = [hitSound]
const playHitSound = (collision) =>
{
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if (impactStrength > 5) {
        const sound = sounds[Math.floor(Math.random() * sounds.length)]
        sound.currentTime = 0
        sound.play()
}
}
// Scene
const scene = new THREE.Scene()

const world = new CANNON.World();
world.broadphase = new CANNON.SAPBroadphase(world);
world.allowSleep = true
world.gravity.set( 0 , -9.8 , 0 )

const floorMaterial = new CANNON.Material("floor");
const objectMaterial = new CANNON.Material("object");

const floorObjectContactMaterial = new CANNON.ContactMaterial( floorMaterial , objectMaterial ,{
    friction: 0.1,
    restitution: 0.7
})

world.addContactMaterial(floorObjectContactMaterial)

// const sphareShape = new CANNON.Sphere(0.5);
// const sphareBody = new CANNON.Body({
//     mass: 1,
//     position: new CANNON.Vec3(0,4,0),
//     shape: sphareShape,
//     material: objectMaterial
// })

// world.addBody(sphareBody)

const flooreShape = new CANNON.Box(new CANNON.Vec3(12, 0.1 , 12));
const floorBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0,0,0),
    shape: flooreShape,
    material: floorMaterial
})

world.addBody(floorBody)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

const updateObject = []

const createSphere = (position)=>{
    
    const size = (Math.random() * 2 ) + 0.5
    const halfSize = size * 0.5

    const shape = new CANNON.Box(new CANNON.Vec3(halfSize,halfSize,halfSize));
    const body = new CANNON.Body({
    mass: 1,
    shape: shape,
    material: objectMaterial
    })
    body.position.copy(position)
    body.addEventListener('collide',playHitSound)
    world.addBody(body);

    gltfLoader.load('/model/Duck/glTF/Duck.gltf', (gltf) => {

        const duck = gltf.scene
        
        duck.scale.set(size,size,size) // adjust size
        duck.position.set(0,-halfSize,0)
        duck.castShadow = true

        scene.add(duck)

    
        updateObject.push({
            mesh: duck,
            object: body,
            offsetY: halfSize 
        })
    })
}

createSphere(0.8,{x:0,y:4,z:0})


const floor = new THREE.Mesh(
    new THREE.BoxGeometry(25,0.72,25),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.receiveShadow = true
floor.position.y = 0
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.1)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldTime = 0
const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldTime ;
    oldTime = elapsedTime
    // Update controls
    controls.update()

    for(const object of updateObject){
        object.mesh.position.copy(object.object.position);
        object.mesh.quaternion.copy(object.object.quaternion)
        const offset = new THREE.Vector3(0, object.offsetY, 0)
        offset.applyQuaternion(object.mesh.quaternion)
        // object.mesh.position.y -= 0.5
    }
    
    world.step(1/60,deltaTime,3)
    // sphere.position.copy(sphareBody.position)
    // sphareBody.applyForce(new CANNON.Vec3(-0.5,0,0),sphareBody.position)
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()