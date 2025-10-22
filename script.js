import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

AOS.init();

// Adicionado: Header Transparente no Scroll
const header = document.getElementById("site-header");
let camera, scene, renderer;

let isUserInteracting = false,
  onPointerDownMouseX = 0, onPointerDownMouseY = 0,
  lon = 0, onPointerDownLon = 0,
  lat = 0, onPointerDownLat = 0,
  phi = 0, theta = 0;


window.addEventListener("scroll", () => {
  // Adiciona a classe 'scrolled' após rolar 50 pixels
  if (window.scrollY > 700) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  // 1. Se a câmera ainda não carregou ou se o usuário está
  //    arrastando ativamente, ignora o evento de scroll.
  if (!camera || isUserInteracting) {
    return;
  }

  // Calcula a altura total rolável
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

  // Evita divisão por zero se a página não tiver scroll
  if (scrollableHeight <= 0) return;

  // 2. Normaliza a posição do scroll (valor de 0 a 1)
  const scrollPercent = window.scrollY / scrollableHeight;

  // 3. Define a rotação em GRAUS (pois 'lon' é tratada como graus)
  //    Ajuste o multiplicador (360) para mais ou menos rotação.
  //    (Seu valor original de Math.PI * 16 era em radianos e muito alto,
  //    equivalendo a 2880 graus. 360 significa uma volta completa).
  const rotationDeg = scrollPercent * 360;

  // 4. ATUALIZADO: Define o 'lon' (longitude)
  //    O loop 'animate' vai usar esse valor para girar a câmera.
  lon = rotationDeg;
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


init();

function init() {

  const container = document.getElementById('arena');

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);

  scene = new THREE.Scene();

  const geometry = new THREE.SphereGeometry(500, 60, 40);
  // invert the geometry on the x-axis so that all of the faces point inward
  geometry.scale(- 1, 1, 1);

  const texture = new THREE.TextureLoader().load('assets/panorama2.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({ map: texture });

  const mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);
  container.appendChild(renderer.domElement);

  container.style.touchAction = 'none';
  container.addEventListener('pointerdown', onPointerDown);

  window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

function onPointerDown(event) {

  if (event.isPrimary === false) return;

  isUserInteracting = true;

  onPointerDownMouseX = event.clientX;
  onPointerDownMouseY = event.clientY;

  onPointerDownLon = lon;
  onPointerDownLat = lat;

  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event) {

  if (event.isPrimary === false) return;

  lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
  lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;

}

function onPointerUp(event) {

  if (event.isPrimary === false) return;

  isUserInteracting = false;

  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);

}


function animate() {

  lat = Math.max(- 85, Math.min(85, lat));
  phi = THREE.MathUtils.degToRad(90 - lat);
  theta = THREE.MathUtils.degToRad(lon);

  const x = 500 * Math.sin(phi) * Math.cos(theta);
  const y = 500 * Math.cos(phi);
  const z = 500 * Math.sin(phi) * Math.sin(theta);

  camera.lookAt(x, y, z);

  renderer.render(scene, camera);

}

