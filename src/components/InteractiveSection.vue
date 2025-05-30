<template>
  <section class="interactive-section" ref="sectionRef">
    <InteractiveEffects :colors="['#ff00ff', '#00ffff', '#ff0000', '#00ff00']" :maxRipples="8" :maxTrails="25" :maxWaves="4" />
    <div class="section-background">
      <div class="cyber-grid"></div>
      <div class="neon-lines"></div>
      <div class="hologram-sphere"></div>
    </div>

    <div class="section-content" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 1000 } }">
      <h2 class="section-title" ref="titleRef">
        <span class="title-line cyber-text" data-text="ИНТЕРАКТИВНЫЙ">ИНТЕРАКТИВНЫЙ</span>
        <span class="title-line cyber-text" data-text="ОПЫТ">ОПЫТ</span>
      </h2>

      <div class="interactive-container">
        <div class="cube-container" ref="cubeRef">
          <div class="cube" :style="{ transform: cubeRotation }">
            <div class="cube-face front">
              <div class="face-content">3D</div>
            </div>
            <div class="cube-face back">
              <div class="face-content">EFFECTS</div>
            </div>
            <div class="cube-face right">
              <div class="face-content">NEON</div>
            </div>
            <div class="cube-face left">
              <div class="face-content">GLOW</div>
            </div>
            <div class="cube-face top">
              <div class="face-content">COOL</div>
            </div>
            <div class="cube-face bottom">
              <div class="face-content">STUFF</div>
            </div>
          </div>
        </div>

        <div class="floating-cards">
          <div
            v-for="(card, index) in cards"
            :key="index"
            class="floating-card"
            :style="{
              '--delay': `${index * 0.2}s`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--rotation': `${Math.random() * 360}deg`
            }"
            v-motion
            :initial="{ opacity: 0, scale: 0 }"
            :enter="{
              opacity: 1,
              scale: 1,
              transition: {
                delay: index * 200,
                type: 'spring',
                stiffness: 100
              }
            }"
            @mouseenter="onCardHover(index)"
            @mouseleave="onCardLeave(index)"
          >
            <div class="card-content">
              <div class="card-icon">{{ card.icon }}</div>
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-description">{{ card.description }}</p>
            </div>
            <div class="card-glow"></div>
            <div class="card-particles"></div>
          </div>
        </div>
      </div>

      <div class="interactive-elements">
        <div
          v-for="n in 20"
          :key="n"
          class="cyber-element"
          :style="{
            '--size': `${Math.random() * 50 + 20}px`,
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--delay': `${Math.random() * 5}s`,
            '--duration': `${Math.random() * 10 + 10}s`
          }"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { gsap } from 'gsap'
import InteractiveEffects from './InteractiveEffects.vue'

const sectionRef = ref<HTMLElement | null>(null)
const cubeRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)

const cards = [
  {
    icon: '🎮',
    title: 'ИНТЕРАКТИВ',
    description: 'Управляйте элементами в реальном времени'
  },
  {
    icon: '🎨',
    title: 'КРЕАТИВ',
    description: 'Уникальные визуальные эффекты'
  },
  {
    icon: '⚡',
    title: 'ЭНЕРГИЯ',
    description: 'Динамичные анимации и переходы'
  },
  {
    icon: '🌟',
    title: 'МАГИЯ',
    description: 'Завораживающие неоновые эффекты'
  }
]

const cubeRotation = computed(() => {
  if (!cubeRef.value) return ''
  const { clientX, clientY } = mousePosition.value
  const { left, top, width, height } = cubeRef.value.getBoundingClientRect()
  const x = (clientX - left) / width
  const y = (clientY - top) / height
  return `rotateX(${(y - 0.5) * 30}deg) rotateY(${(x - 0.5) * 30}deg)`
})

const mousePosition = ref({ clientX: 0, clientY: 0 })

const handleMouseMove = (e: MouseEvent) => {
  mousePosition.value = { clientX: e.clientX, clientY: e.clientY }
}

const onCardHover = (index: number) => {
  const card = document.querySelectorAll('.floating-card')[index]
  if (!card) return

  gsap.to(card, {
    scale: 1.1,
    rotateY: 10,
    duration: 0.3,
    ease: 'power2.out'
  })

  gsap.to(card.querySelector('.card-glow'), {
    opacity: 1,
    scale: 1.2,
    duration: 0.3
  })

  gsap.to(card.querySelector('.card-particles'), {
    opacity: 1,
    scale: 1,
    duration: 0.3
  })
}

const onCardLeave = (index: number) => {
  const card = document.querySelectorAll('.floating-card')[index]
  if (!card) return

  gsap.to(card, {
    scale: 1,
    rotateY: 0,
    duration: 0.3
  })

  gsap.to(card.querySelector('.card-glow'), {
    opacity: 0.5,
    scale: 1,
    duration: 0.3
  })

  gsap.to(card.querySelector('.card-particles'), {
    opacity: 0,
    scale: 0.8,
    duration: 0.3
  })
}

onMounted(() => {
  if (sectionRef.value) {
    sectionRef.value.addEventListener('mousemove', handleMouseMove)
  }

  // Анимация заголовка
  if (titleRef.value) {
    gsap.from('.cyber-text', {
      duration: 1,
      y: 100,
      opacity: 0,
      stagger: 0.2,
      ease: 'power4.out'
    })
  }

  // Анимация кибер-элементов
  gsap.to('.cyber-element', {
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
.interactive-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  overflow: hidden;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
}

.section-background {
  position: absolute;
  inset: 0;
  z-index: 1;

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

  .neon-lines {
    position: absolute;
    inset: 0;
    background: 
      linear-gradient(90deg, transparent 0%, rgba(0, 255, 255, 0.2) 50%, transparent 100%),
      linear-gradient(0deg, transparent 0%, rgba(255, 0, 255, 0.2) 50%, transparent 100%);
    filter: blur(20px);
    animation: neonPulse 4s ease-in-out infinite;
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
}

.section-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rem;
}

.section-title {
  text-align: center;
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 2rem;

  .cyber-text {
    display: block;
    position: relative;
    color: #fff;
    text-shadow:
      0 0 5px #fff,
      0 0 10px #0ff,
      0 0 20px #0ff,
      0 0 40px #0ff;
    animation: cyberPulse 2s infinite;

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
      animation: cyberGlitch 2s infinite linear alternate-reverse;
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
      animation: cyberGlitch 2s infinite linear alternate-reverse;
    }
  }
}

.interactive-container {
  display: flex;
  gap: 4rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
}

.cube-container {
  width: 300px;
  height: 300px;
  perspective: 1000px;
}

.cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    opacity: 0.2;
    z-index: -1;
  }
}

.front  { transform: translateZ(150px); }
.back   { transform: rotateY(180deg) translateZ(150px); }
.right  { transform: rotateY(90deg) translateZ(150px); }
.left   { transform: rotateY(-90deg) translateZ(150px); }
.top    { transform: rotateX(90deg) translateZ(150px); }
.bottom { transform: rotateX(-90deg) translateZ(150px); }

.floating-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 800px;
}

.floating-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
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

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-description {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.8;
}

.card-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle at center,
    rgba(255, 0, 255, 0.5) 0%,
    rgba(0, 255, 255, 0.5) 50%,
    transparent 70%);
  opacity: 0.5;
  filter: blur(20px);
  transition: all 0.3s ease;
  z-index: 0;
}

.card-particles {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at center,
    rgba(255, 255, 255, 0.8) 0%,
    transparent 60%);
  opacity: 0;
  scale: 0.8;
  transition: all 0.3s ease;
  z-index: 0;
}

.cyber-element {
  position: absolute;
  width: var(--size);
  height: var(--size);
  left: var(--x);
  top: var(--y);
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  opacity: 0.1;
  filter: blur(10px);
  pointer-events: none;
}

@keyframes gridMove {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(50px);
  }
}

@keyframes neonPulse {
  0%, 100% {
    opacity: 0.5;
    filter: blur(20px) brightness(1);
  }
  50% {
    opacity: 0.8;
    filter: blur(30px) brightness(1.5);
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

@keyframes cyberPulse {
  0%, 100% {
    text-shadow:
      0 0 5px #fff,
      0 0 10px #0ff,
      0 0 20px #0ff,
      0 0 40px #0ff;
  }
  50% {
    text-shadow:
      0 0 10px #fff,
      0 0 20px #0ff,
      0 0 40px #0ff,
      0 0 80px #0ff;
  }
}

@keyframes cyberGlitch {
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

@media (max-width: 768px) {
  .interactive-container {
    flex-direction: column;
    gap: 2rem;
  }

  .cube-container {
    width: 200px;
    height: 200px;
  }

  .front  { transform: translateZ(100px); }
  .back   { transform: rotateY(180deg) translateZ(100px); }
  .right  { transform: rotateY(90deg) translateZ(100px); }
  .left   { transform: rotateY(-90deg) translateZ(100px); }
  .top    { transform: rotateX(90deg) translateZ(100px); }
  .bottom { transform: rotateX(-90deg) translateZ(100px); }

  .floating-cards {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
