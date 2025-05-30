<template>
  <section class="animated-section" ref="sectionRef">
    <div class="section-background">
      <div class="matrix-rain"></div>
      <div class="energy-waves"></div>
      <div class="quantum-particles"></div>
    </div>

    <div class="section-content" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 1000 } }">
      <div class="text-container" ref="textContainerRef">
        <h2 class="animated-title">
          <span class="title-word" v-for="(word, index) in titleWords" :key="index" :style="{ '--delay': `${index * 0.2}s` }">
            {{ word }}
          </span>
        </h2>
        <p class="animated-description" ref="descriptionRef">
          {{ description }}
        </p>
      </div>

      <div class="interactive-elements">
        <div
          v-for="(element, index) in interactiveElements"
          :key="index"
          class="interactive-element"
          :style="{
            '--x': `${element.x}%`,
            '--y': `${element.y}%`,
            '--size': `${element.size}px`,
            '--delay': `${index * 0.1}s`,
            '--duration': `${element.duration}s`
          }"
          @mouseenter="onElementHover(index)"
          @mouseleave="onElementLeave(index)"
        >
          <div class="element-content">
            <div class="element-icon">{{ element.icon }}</div>
            <div class="element-text">{{ element.text }}</div>
          </div>
          <div class="element-glow"></div>
          <div class="element-particles"></div>
        </div>
      </div>

      <div class="floating-symbols">
        <div
          v-for="n in 30"
          :key="n"
          class="floating-symbol"
          :style="{
            '--symbol': `'${getRandomSymbol()}'`,
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
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const sectionRef = ref<HTMLElement | null>(null)
const textContainerRef = ref<HTMLElement | null>(null)
const descriptionRef = ref<HTMLElement | null>(null)

const titleWords = ['ИННОВАЦИИ', 'ТЕХНОЛОГИИ', 'БУДУЩЕЕ']
const description = 'Погрузитесь в мир современных технологий и инноваций. Наш интерактивный интерфейс создан для того, чтобы удивить и вдохновить.'

const interactiveElements = [
  {
    icon: '💫',
    text: 'АНИМАЦИИ',
    x: 20,
    y: 30,
    size: 120,
    duration: 15
  },
  {
    icon: '🎮',
    text: 'ИНТЕРАКТИВ',
    x: 60,
    y: 50,
    size: 150,
    duration: 20
  },
  {
    icon: '⚡',
    text: 'ЭНЕРГИЯ',
    x: 40,
    y: 70,
    size: 100,
    duration: 18
  },
  {
    icon: '🌟',
    text: 'МАГИЯ',
    x: 80,
    y: 40,
    size: 130,
    duration: 17
  }
]

const symbols = '★☆⚡✨💫🌟⭐️🔮🎮🎨🎭🎪🎯🎲🎳🎯🎨🎭🎪🎯🎲🎳'

const getRandomSymbol = () => {
  return symbols[Math.floor(Math.random() * symbols.length)]
}

const onElementHover = (index: number) => {
  const element = document.querySelectorAll('.interactive-element')[index]
  if (!element) return

  gsap.to(element, {
    scale: 1.2,
    rotate: 5,
    duration: 0.3,
    ease: 'power2.out'
  })

  gsap.to(element.querySelector('.element-glow'), {
    opacity: 1,
    scale: 1.5,
    duration: 0.3
  })

  gsap.to(element.querySelector('.element-particles'), {
    opacity: 1,
    scale: 1,
    duration: 0.3
  })
}

const onElementLeave = (index: number) => {
  const element = document.querySelectorAll('.interactive-element')[index]
  if (!element) return

  gsap.to(element, {
    scale: 1,
    rotate: 0,
    duration: 0.3
  })

  gsap.to(element.querySelector('.element-glow'), {
    opacity: 0.5,
    scale: 1,
    duration: 0.3
  })

  gsap.to(element.querySelector('.element-particles'), {
    opacity: 0,
    scale: 0.8,
    duration: 0.3
  })
}

onMounted(() => {
  // Анимация заголовка
  gsap.from('.title-word', {
    duration: 1,
    y: 100,
    opacity: 0,
    stagger: 0.2,
    ease: 'power4.out'
  })

  // Анимация описания
  if (descriptionRef.value) {
    gsap.from(descriptionRef.value, {
      duration: 1,
      y: 50,
      opacity: 0,
      delay: 0.5,
      ease: 'power2.out'
    })
  }

  // Анимация интерактивных элементов
  gsap.from('.interactive-element', {
    duration: 1,
    scale: 0,
    opacity: 0,
    stagger: 0.1,
    delay: 0.8,
    ease: 'back.out(1.7)'
  })

  // Анимация плавающих символов
  gsap.to('.floating-symbol', {
    y: '+=100',
    rotation: 360,
    duration: 'var(--duration)',
    delay: 'var(--delay)',
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  })
})
</script>

<style lang="scss" scoped>
.animated-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  overflow: hidden;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-background {
  position: absolute;
  inset: 0;
  z-index: 1;

  .matrix-rain {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg,
      transparent 0%,
      rgba(0, 255, 0, 0.1) 50%,
      transparent 100%);
    filter: blur(1px);
    animation: matrixRain 20s linear infinite;
  }

  .energy-waves {
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 30% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 70% 50%, rgba(255, 0, 255, 0.1) 0%, transparent 50%);
    filter: blur(30px);
    animation: energyPulse 4s ease-in-out infinite;
  }

  .quantum-particles {
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at center, rgba(0, 255, 255, 0.1) 0%, transparent 50%);
    filter: blur(20px);
    animation: quantumFloat 10s ease-in-out infinite;
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

.text-container {
  text-align: center;
  max-width: 800px;
}

.animated-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  text-transform: uppercase;
  margin-bottom: 2rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;

  .title-word {
    position: relative;
    display: inline-block;
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: titleFloat 3s ease-in-out infinite;
    animation-delay: var(--delay);

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
}

.animated-description {
  font-size: clamp(1rem, 3vw, 1.5rem);
  line-height: 1.6;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    inset: -20px;
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    opacity: 0.1;
    filter: blur(20px);
    z-index: -1;
  }
}

.interactive-elements {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
}

.interactive-element {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 2rem;
  color: white;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
  overflow: hidden;
  cursor: pointer;

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

.element-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.element-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.element-text {
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.element-glow {
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

.element-particles {
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

.floating-symbols {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.floating-symbol {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-size: clamp(1rem, 2vw, 2rem);
  color: rgba(255, 255, 255, 0.2);
  animation: float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);

  &::before {
    content: var(--symbol);
  }
}

@keyframes matrixRain {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
}

@keyframes energyPulse {
  0%, 100% {
    opacity: 0.5;
    filter: blur(30px) brightness(1);
  }
  50% {
    opacity: 0.8;
    filter: blur(40px) brightness(1.5);
  }
}

@keyframes quantumFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.1);
  }
}

@keyframes titleFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
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

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@media (max-width: 768px) {
  .section-content {
    padding: 2rem 1rem;
    gap: 2rem;
  }

  .interactive-elements {
    grid-template-columns: 1fr;
  }

  .animated-title {
    font-size: clamp(2rem, 6vw, 3rem);
  }

  .animated-description {
    font-size: clamp(0.9rem, 2.5vw, 1.2rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style> 