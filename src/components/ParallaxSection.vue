<template>
  <section class="parallax-section" ref="sectionRef">
    <InteractiveEffects :colors="['#ff00ff', '#00ffff', '#ff0000', '#00ff00', '#0000ff']" :maxRipples="6" :maxTrails="30" :maxWaves="5" />
    <div class="parallax-background">
      <div class="stars"></div>
      <div class="twinkling"></div>
      <div class="clouds"></div>
    </div>

    <div class="parallax-content" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 1000 } }">
      <div class="parallax-layers">
        <div class="layer layer-1" ref="layer1">
          <h2 class="cyber-title" data-text="ПАРАЛЛАКС">ПАРАЛЛАКС</h2>
        </div>
        <div class="layer layer-2" ref="layer2">
          <div class="cyber-grid"></div>
        </div>
        <div class="layer layer-3" ref="layer3">
          <div class="hologram-sphere"></div>
        </div>
      </div>

      <div class="floating-elements">
        <div v-for="n in 20" :key="n" class="floating-element" 
          :style="{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${Math.random() * 100 + 50}px`,
            '--delay': `${Math.random() * 5}s`,
            '--duration': `${Math.random() * 10 + 10}s`
          }"
        ></div>
      </div>

      <div class="overlay-blocks">
        <div v-for="(block, index) in blocks" :key="index"
          class="overlay-block"
          :style="{ '--delay': `${index * 0.2}s` }"
          @mouseenter="onBlockHover(index)"
          @mouseleave="onBlockLeave(index)"
          ref="blockRefs"
        >
          <div class="block-content">
            <div class="block-icon">{{ block.icon }}</div>
            <h3 class="block-title">{{ block.title }}</h3>
            <p class="block-description">{{ block.description }}</p>
          </div>
          <div class="block-background">
            <div class="block-glow"></div>
            <div class="block-particles"></div>
            <div class="block-grid"></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import InteractiveEffects from './InteractiveEffects.vue'

const sectionRef = ref<HTMLElement | null>(null)
const layer1 = ref<HTMLElement | null>(null)
const layer2 = ref<HTMLElement | null>(null)
const layer3 = ref<HTMLElement | null>(null)

const blockRefs = ref<(HTMLElement | null)[]>([])

const blocks = [
  {
    icon: '🌌',
    title: 'КОСМИЧЕСКИЙ ПОРТАЛ',
    description: 'Врата в другие измерения'
  },
  {
    icon: '🌠',
    title: 'ЗВЕЗДНЫЙ ПУТЬ',
    description: 'Путешествие сквозь галактики'
  },
  {
    icon: '🌪️',
    title: 'ЭНЕРГЕТИЧЕСКИЙ ВИХРЬ',
    description: 'Космические потоки энергии'
  },
  {
    icon: '🌍',
    title: 'ПЛАНЕТАРНЫЙ ПОРТАЛ',
    description: 'Переход между мирами'
  }
]

const handleMouseMove = (e: MouseEvent) => {
  if (!sectionRef.value) return
  
  const { clientX, clientY } = e
  const { left, top, width, height } = sectionRef.value.getBoundingClientRect()
  const x = (clientX - left) / width
  const y = (clientY - top) / height

  if (layer1.value) {
    gsap.to(layer1.value, {
      x: (x - 0.5) * 50,
      y: (y - 0.5) * 50,
      rotation: (x - 0.5) * 10,
      duration: 1,
      ease: 'power2.out'
    })
  }

  if (layer2.value) {
    gsap.to(layer2.value, {
      x: (x - 0.5) * 100,
      y: (y - 0.5) * 100,
      rotation: (x - 0.5) * 20,
      duration: 1.5,
      ease: 'power2.out'
    })
  }

  if (layer3.value) {
    gsap.to(layer3.value, {
      x: (x - 0.5) * 150,
      y: (y - 0.5) * 150,
      rotation: (x - 0.5) * 30,
      duration: 2,
      ease: 'power2.out'
    })
  }

  gsap.to('.overlay-block', {
    x: (x - 0.5) * 40,
    y: (y - 0.5) * 40,
    rotationX: (y - 0.5) * 15,
    rotationY: (x - 0.5) * 15,
    duration: 1.2,
    ease: 'power2.out',
    stagger: {
      amount: 0.3,
      from: 'random'
    }
  })
}

const onBlockHover = (index: number) => {
  const block = blockRefs.value[index]
  if (!block) return

  gsap.to(block, {
    scale: 1.05,
    rotateY: 15,
    duration: 0.4,
    ease: 'power2.out'
  })

  gsap.to(block.querySelector('.block-glow'), {
    opacity: 1,
    scale: 1.2,
    duration: 0.4
  })

  gsap.to(block.querySelector('.block-particles'), {
    opacity: 1,
    scale: 1,
    duration: 0.4
  })

  gsap.to(block.querySelector('.block-grid'), {
    opacity: 0.5,
    duration: 0.4
  })
}

const onBlockLeave = (index: number) => {
  const block = blockRefs.value[index]
  if (!block) return

  gsap.to(block, {
    scale: 1,
    rotateY: 0,
    duration: 0.4
  })

  gsap.to(block.querySelector('.block-glow'), {
    opacity: 0.5,
    scale: 1,
    duration: 0.4
  })

  gsap.to(block.querySelector('.block-particles'), {
    opacity: 0,
    scale: 0.8,
    duration: 0.4
  })

  gsap.to(block.querySelector('.block-grid'), {
    opacity: 0,
    duration: 0.4
  })
}

onMounted(() => {
  if (sectionRef.value) {
    sectionRef.value.addEventListener('mousemove', handleMouseMove)
  }

  // Анимация появления элементов
  gsap.from('.cyber-title', {
    duration: 1,
    y: 100,
    opacity: 0,
    ease: 'power4.out'
  })

  // Изменяем анимацию появления блоков
  gsap.fromTo('.overlay-block', 
    {
      scale: 0.8,
      opacity: 0,
      y: 50
    },
    {
      scale: 1,
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      delay: 0.5,
      ease: 'power2.out',
      clearProps: 'all'
    }
  )

  // Анимация фоновых элементов
  gsap.to('.floating-element', {
    y: '+=100',
    rotation: 360,
    duration: 'var(--duration)',
    delay: 'var(--delay)',
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  })
})

onUnmounted(() => {
  if (sectionRef.value) {
    sectionRef.value.removeEventListener('mousemove', handleMouseMove)
  }
})
</script>

<style lang="scss" scoped>
.parallax-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  overflow: hidden;
  perspective: 1000px;
}

.parallax-background {
  position: absolute;
  inset: 0;
  z-index: 1;

  .stars {
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.1;
    animation: twinkle 4s infinite;
  }

  .twinkling {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center,
      rgba(255, 255, 255, 0.8) 0%,
      transparent 60%);
    opacity: 0.1;
    animation: twinkle 2s infinite;
  }

  .clouds {
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%);
    filter: blur(20px);
    animation: cloudMove 20s linear infinite;
  }
}

.parallax-content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  box-sizing: border-box;
}

.parallax-layers {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  pointer-events: none;
  top: 0;
  left: 0;
}

.layer {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-style: preserve-3d;
}

.cyber-title {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-transform: uppercase;
  color: transparent;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  text-shadow: 
    0 0 10px rgba(255, 0, 255, 0.5),
    0 0 20px rgba(0, 255, 255, 0.5);
  animation: cyberPulse 2s infinite;
  margin-top: 4rem;

  &::before {
    content: attr(data-text);
    position: absolute;
    left: -2px;
    text-shadow: 2px 0 #ff00ff;
    top: 0;
    color: #fff;
    background: #000;
    overflow: hidden;
    clip: rect(0, 900px, 0, 0);
    animation: glitch 2s infinite linear alternate-reverse;
  }

  &::after {
    content: attr(data-text);
    position: absolute;
    left: 2px;
    text-shadow: -2px 0 #00ffff;
    top: 0;
    color: #fff;
    background: #000;
    overflow: hidden;
    clip: rect(0, 900px, 0, 0);
    animation: glitch 2s infinite linear alternate-reverse;
  }
}

.cyber-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  transform: perspective(500px) rotateX(60deg);
  transform-origin: top;
  animation: gridMove 20s linear infinite;
}

.hologram-sphere {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  background: radial-gradient(circle at center,
    rgba(0, 255, 255, 0.1) 0%,
    rgba(255, 0, 255, 0.1) 25%,
    transparent 50%);
  filter: blur(100px);
  animation: hologramRotate 30s linear infinite;
}

.overlay-blocks {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
  max-width: 1200px;
  margin-top: auto;
  margin-bottom: 4rem;
  padding: 0 2rem;
  box-sizing: border-box;
  transform-style: preserve-3d;
}

.overlay-block {
  position: relative;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  color: white;
  transform-style: preserve-3d;
  transition: all 0.4s ease;
  cursor: pointer;
  height: 200px;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  opacity: 1;
  transform: translateZ(0);
  will-change: transform;

  &:hover {
    transform: translateZ(30px) rotateX(5deg) rotateY(5deg);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 15px;
    padding: 2px;
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask: 
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
}

.block-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  transform-style: preserve-3d;
}

.block-icon {
  font-size: clamp(2rem, 4vw, 2.5rem);
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 15px #ff00ff);
  transform: translateZ(20px);
}

.block-title {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  font-weight: 700;
  text-transform: uppercase;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
  transform: translateZ(15px);
}

.block-description {
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  line-height: 1.4;
  opacity: 0.8;
  max-width: 90%;
  transform: translateZ(10px);
}

.block-background {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  overflow: hidden;
  z-index: 1;

  .block-glow {
    position: absolute;
    inset: -10px;
    background: radial-gradient(circle at center,
      rgba(255, 0, 255, 0.3) 0%,
      rgba(0, 255, 255, 0.3) 50%,
      transparent 70%);
    opacity: 0.5;
    filter: blur(20px);
    transition: all 0.4s ease;
  }

  .block-particles {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at center,
      rgba(255, 255, 255, 0.8) 0%,
      transparent 60%);
    opacity: 0;
    scale: 0.8;
    transition: all 0.4s ease;
  }

  .block-grid {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0;
    transition: opacity 0.4s ease;
  }
}

.floating-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  width: var(--size);
  height: var(--size);
  left: var(--x);
  top: var(--y);
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  opacity: 0.1;
  filter: blur(10px);
}

@keyframes twinkle {
  0%, 100% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes cloudMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes cyberPulse {
  0%, 100% {
    text-shadow: 
      0 0 10px rgba(255, 0, 255, 0.5),
      0 0 20px rgba(0, 255, 255, 0.5);
  }
  50% {
    text-shadow: 
      0 0 20px rgba(255, 0, 255, 0.8),
      0 0 40px rgba(0, 255, 255, 0.8);
  }
}

@keyframes glitch {
  0% {
    clip: rect(42px, 9999px, 44px, 0);
  }
  5% {
    clip: rect(12px, 9999px, 59px, 0);
  }
  10% {
    clip: rect(48px, 9999px, 29px, 0);
  }
  15% {
    clip: rect(42px, 9999px, 73px, 0);
  }
  20% {
    clip: rect(63px, 9999px, 27px, 0);
  }
  25% {
    clip: rect(34px, 9999px, 55px, 0);
  }
  30% {
    clip: rect(86px, 9999px, 73px, 0);
  }
  35% {
    clip: rect(20px, 9999px, 20px, 0);
  }
  40% {
    clip: rect(26px, 9999px, 60px, 0);
  }
  45% {
    clip: rect(25px, 9999px, 66px, 0);
  }
  50% {
    clip: rect(57px, 9999px, 98px, 0);
  }
  55% {
    clip: rect(5px, 9999px, 46px, 0);
  }
  60% {
    clip: rect(82px, 9999px, 31px, 0);
  }
  65% {
    clip: rect(54px, 9999px, 27px, 0);
  }
  70% {
    clip: rect(28px, 9999px, 99px, 0);
  }
  75% {
    clip: rect(45px, 9999px, 69px, 0);
  }
  80% {
    clip: rect(23px, 9999px, 85px, 0);
  }
  85% {
    clip: rect(54px, 9999px, 84px, 0);
  }
  90% {
    clip: rect(45px, 9999px, 47px, 0);
  }
  95% {
    clip: rect(37px, 9999px, 20px, 0);
  }
  100% {
    clip: rect(4px, 9999px, 91px, 0);
  }
}

@keyframes gridMove {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(50px);
  }
}

@keyframes hologramRotate {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@media (max-width: 768px) {
  .parallax-content {
    padding: 1rem;
  }

  .cyber-title {
    margin-top: 2rem;
  }

  .overlay-blocks {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 500px;
    margin-bottom: 2rem;
    padding: 0 1rem;
  }

  .overlay-block {
    height: 160px;
  }

  .cyber-title {
    font-size: clamp(2rem, 8vw, 4rem);
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .overlay-blocks {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    max-width: 800px;
    margin-bottom: 3rem;
    padding: 0 1.5rem;
  }

  .overlay-block {
    height: 180px;
  }
}

@media (min-width: 1025px) {
  .overlay-blocks {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    max-width: 1200px;
    margin-bottom: 4rem;
    padding: 0 2rem;
  }

  .overlay-block {
    height: 200px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style> 