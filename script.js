import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

AOS.init();

// Adicionado: Header Transparente no Scroll
const header = document.getElementById("site-header");
let camera

window.addEventListener("scroll", () => {
  // Adiciona a classe 'scrolled' após rolar 50 pixels
  if (window.scrollY > 700) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  if (camera) {
    // Normaliza a posição do scroll (valor de 0 a 1)
    const scrollPercent =
      window.scrollY /
      (document.documentElement.scrollHeight - window.innerHeight);

    if (scrollPercent > 20) scrollPercent = 20;

    // Define a rotação.
    // Ajuste o multiplicador (ex: Math.PI) para mais ou menos rotação.
    const rotationY = scrollPercent * Math.PI * 16;

    // ATUALIZADO: Rotaciona a própria câmera no eixo Y (olhar para esquerda/direita)
    camera.rotation.y = rotationY;
  }
});

// Mobile menu toggle (Mantido)
const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("main-nav");

menuToggle &&
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

// Blocos de Smooth scroll e IntersectionObserver (Removidos)

// Gráfico de placeholder (Mantido)
const revenueCtx = document.getElementById("chartRevenue");
if (revenueCtx && window.Chart) {
  new Chart(revenueCtx, {
    type: "line",
    data: {
      labels: ["2019", "2020", "2021", "2022", "2023"],
      datasets: [
        {
          label: "Receita (simulação)",
          data: [120, 140, 220, 280, 340],
          tension: 0.3,
          borderWidth: 2,
          borderColor:
            getComputedStyle(document.documentElement).getPropertyValue(
              "--club-red"
            ) || "#c8102e",
          backgroundColor: "transparent",
        },
      ],
    },
    options: { responsive: true, plugins: { legend: { display: false } } },
  });
}


let controls;
let renderer;
let scene;

//init();

function init() {
  const container = document.getElementById("arena");

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 0.01;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.rotateSpeed = -0.25;

  const textures = getTexturesFromAtlasFile(
    "https://threejs.org/examples/textures/cube/sun_temple_stripe.jpg",
    6
  );

  const materials = [];

  for (let i = 0; i < 6; i++) {
    materials.push(new THREE.MeshBasicMaterial({ map: textures[i] }));
  }

  const skyBox = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), materials);
  skyBox.geometry.scale(1, 1, -1);
  scene.add(skyBox);

  window.addEventListener("resize", onWindowResize);
}

function getTexturesFromAtlasFile(atlasImgUrl, tilesNum) {
  const textures = [];

  for (let i = 0; i < tilesNum; i++) {
    textures[i] = new THREE.Texture();
  }

  new THREE.ImageLoader().load(atlasImgUrl, (image) => {
    let canvas, context;
    const tileWidth = image.height;

    for (let i = 0; i < textures.length; i++) {
      canvas = document.createElement("canvas");
      context = canvas.getContext("2d");
      canvas.height = tileWidth;
      canvas.width = tileWidth;
      context.drawImage(
        image,
        tileWidth * i,
        0,
        tileWidth,
        tileWidth,
        0,
        0,
        tileWidth,
        tileWidth
      );
      textures[i].colorSpace = THREE.SRGBColorSpace;
      textures[i].image = canvas;
      textures[i].needsUpdate = true;
    }
  });

  return textures;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  controls.update(); // required when damping is enabled

  renderer.render(scene, camera);
}
