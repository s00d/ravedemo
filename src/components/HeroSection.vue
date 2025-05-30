<template>
  <section class="hero-section" ref="heroRef">
    <InteractiveEffects :colors="['#ff00ff', '#00ffff', '#ff0000']" :maxRipples="3" :maxTrails="15" :maxWaves="2" />
    <div class="particles-container" ref="particlesRef"></div>
    
    <div class="noise-overlay"></div>
    <div class="gradient-sphere"></div>
    
    <div
      class="hero-content"
      v-motion
      :initial="{ opacity: 0, y: 100 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 1000 } }"
    >
      <h1 
        class="glitch-text" 
        ref="titleRef"
        data-text="ДОБРО ПОЖАЛОВАТЬ В БУДУЩЕЕ"
      >
        <span class="glitch-line" data-text="ДОБРО ПОЖАЛОВАТЬ">ДОБРО ПОЖАЛОВАТЬ</span>
        <span class="glitch-line" data-text="В БУДУЩЕЕ">В БУДУЩЕЕ</span>
      </h1>
      
      <div class="floating-elements">
        <div
          v-for="n in 20"
          :key="n"
          class="floating-element"
          :style="{ 
            '--delay': `${n * 0.1}s`,
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--rotation': `${Math.random() * 360}deg`,
            '--scale': `${0.5 + Math.random() * 1.5}`
          }"
          v-motion
          :initial="{ scale: 0, rotate: 0 }"
          :enter="{ 
            scale: 1, 
            rotate: 360, 
            transition: { 
              duration: 1000, 
              delay: n * 100,
              type: 'spring',
              stiffness: 100
            } 
          }"
        >
          <div class="element-content" :class="{ 'pulse': n % 3 === 0 }">★</div>
          <div class="element-glow"></div>
        </div>
      </div>

      <div
        class="cta-container"
        v-motion
        :initial="{ opacity: 0, scale: 0.5 }"
        :enter="{ 
          opacity: 1, 
          scale: 1, 
          transition: { 
            delay: 1000, 
            duration: 800,
            type: 'spring',
            stiffness: 200
          } 
        }"
      >
        <button
          class="cta-button"
          @mouseenter="onButtonHover"
          @mouseleave="onButtonLeave"
          @click="smoothScroll"
          ref="buttonRef"
        >
          <span class="button-text">НАЧАТЬ ПУТЕШЕСТВИЕ</span>
          <div class="button-particles"></div>
          <div class="button-glow"></div>
        </button>
      </div>
    </div>

    <div
      class="scroll-indicator"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ 
        opacity: 1, 
        transition: { 
          delay: 2000,
          type: 'spring',
          stiffness: 100
        } 
      }"
    >
      <div class="mouse">
        <div class="wheel"></div>
        <div class="mouse-glow"></div>
      </div>
      <div class="arrow">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="background-elements">
      <div 
        v-for="n in 5" 
        :key="n"
        class="background-element"
        :style="{
          '--size': `${100 + n * 50}px`,
          '--x': `${Math.random() * 100}%`,
          '--y': `${Math.random() * 100}%`,
          '--delay': `${n * 0.5}s`,
          '--duration': `${10 + n * 5}s`
        }"
      ></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { gsap } from 'gsap'
import { useMouseInElement } from '@vueuse/core'
import type { Engine } from '@tsparticles/engine'
import { tsParticles } from '@tsparticles/engine'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'
import InteractiveEffects from './InteractiveEffects.vue'

const heroRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const buttonRef = ref<HTMLElement | null>(null)
const particlesRef = ref<HTMLElement | null>(null)

const { isOutside, elementX, elementY } = useMouseInElement(heroRef)

// Получаем функцию прокрутки из плагина
const smoothScroll = inject('smoothScroll') as () => void

// Эффект параллакса для элементов при движении мыши
const handleMouseMove = (e: MouseEvent) => {
  if (!heroRef.value) return

  const { clientX, clientY } = e
  const { left, top, width, height } = heroRef.value.getBoundingClientRect()

  const x = (clientX - left) / width
  const y = (clientY - top) / height

  gsap.to('.floating-elements', {
    x: (x - 0.5) * 50,
    y: (y - 0.5) * 50,
    duration: 1,
    ease: 'power2.out',
  })
}

// Эффект при наведении на кнопку
const onButtonHover = () => {
  if (!buttonRef.value) return

  gsap.to(buttonRef.value, {
    scale: 1.1,
    duration: 0.3,
    ease: 'back.out',
  })

  gsap.to('.button-particles', {
    opacity: 1,
    scale: 1,
    duration: 0.3,
  })
}

const onButtonLeave = () => {
  if (!buttonRef.value) return

  gsap.to(buttonRef.value, {
    scale: 1,
    duration: 0.3,
  })

  gsap.to('.button-particles', {
    opacity: 0,
    scale: 0.5,
    duration: 0.3,
  })
}

// Инициализация частиц
const initParticles = async () => {
  if (!particlesRef.value) return

  await loadSlim(tsParticles)

  const options: ISourceOptions = {
    id: 'hero-particles',
    fullScreen: false,
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
        },
      },
      color: { value: '#ffffff' },
      shape: { type: 'circle' },
      opacity: {
        value: 0.5,
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      size: {
        value: 3,
        animation: {
          enable: true,
          speed: 2,
          sync: false,
        },
      },
      move: {
        enable: true,
        speed: 2,
        direction: 'none',
        random: true,
        straight: false,
        outModes: { default: 'out' },
        attract: {
          enable: true,
          rotate: { x: 600, y: 1200 },
        },
      },
    },
    interactivity: {
      detectsOn: 'canvas',
      events: {
        onHover: { enable: true, mode: 'repulse' },
        onClick: { enable: true, mode: 'push' },
        resize: { enable: true },
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        push: { quantity: 4 },
      },
    },
  }

  await tsParticles.load({
    element: particlesRef.value,
    options,
  })
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  initParticles()

  // Анимация заголовка
  if (titleRef.value) {
    gsap.from('.glitch-line', {
      duration: 0.8,
      y: 100,
      opacity: 0,
      stagger: 0.2,
      ease: 'power4.out',
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style lang="scss" scoped>
.hero-section {
  position: relative;
  height: 100vh;
  width: 100%;
  background: linear-gradient(45deg, #000000, #1a1a1a);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 1rem;

  @media (max-width: 768px) {
    height: 100dvh;
    padding: 0.5rem;
  }
}

.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2rem;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at center,
      rgba(255, 0, 255, 0.1) 0%,
      rgba(0, 255, 255, 0.1) 25%,
      transparent 50%);
    animation: rotate3d 20s linear infinite;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 100%);
    animation: wave 3s linear infinite;
    pointer-events: none;
  }
}

.glitch-text {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 900;
  text-transform: uppercase;
  position: relative;
  text-shadow:
    0.05em 0 0 #00fffc,
    -0.03em -0.04em 0 #fc00ff,
    0.025em 0.04em 0 #fffc00;
  animation: glitch 725ms infinite;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1rem;
  }
  
  .glitch-line {
    display: block;
    position: relative;
    line-height: 1.2;
    
    &:nth-child(2) {
      animation: glitch 725ms infinite;
      animation-delay: 250ms;
    }
  }
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  .floating-element {
    position: absolute;
    width: clamp(10px, 3vw, 20px);
    height: clamp(10px, 3vw, 20px);
    animation: float 6s ease-in-out infinite;
    animation-delay: var(--delay);
    
    @media (max-width: 768px) {
      display: none;
      
      &:nth-child(-n+10) {
        display: block;
      }
    }
    
    .element-content {
      font-size: clamp(0.8rem, 2vw, 1.5rem);
      color: rgba(255, 255, 255, 0.5);
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    }
  }
}

.cta-button {
  position: relative;
  padding: clamp(1rem, 3vw, 1.5rem) clamp(2rem, 5vw, 3rem);
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  font-weight: bold;
  color: white;
  background: transparent;
  border: 2px solid white;
  border-radius: 50px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    width: 100%;
    max-width: 300px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  .button-particles {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.5);
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
    opacity: 0;
    transition: all 0.3s ease;
  }

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff);
    border-radius: 50px;
    z-index: -2;
    animation: borderGlow 2s linear infinite;
    filter: blur(5px);
  }
}

.scroll-indicator {
  position: absolute;
  bottom: clamp(1rem, 3vw, 2rem);
  left: 50%;
  transform: translateX(-50%);
  
  @media (max-width: 768px) {
    display: none;
  }
  
  .mouse {
    width: clamp(20px, 4vw, 30px);
    height: clamp(35px, 7vw, 50px);
    border: 2px solid white;
    border-radius: 15px;
    position: relative;
    
    .wheel {
      width: 4px;
      height: 8px;
      background: white;
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 2px;
      animation: scroll 2s infinite;
    }
  }
  
  .arrow {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: clamp(0.5rem, 2vw, 1rem);
    
    span {
      display: block;
      width: clamp(6px, 1.5vw, 10px);
      height: clamp(6px, 1.5vw, 10px);
      border-bottom: 2px solid white;
      border-right: 2px solid white;
      transform: rotate(45deg);
      margin: -5px;
      animation: arrow 2s infinite;
      
      &:nth-child(2) {
        animation-delay: 0.2s;
      }
      &:nth-child(3) {
        animation-delay: 0.4s;
      }
    }
  }
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.1;
  mix-blend-mode: overlay;
  animation: noise 0.5s steps(4) infinite;
  pointer-events: none;
}

.gradient-sphere {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  background: radial-gradient(circle at center,
    rgba(255, 0, 255, 0.1) 0%,
    rgba(0, 255, 255, 0.1) 25%,
    rgba(255, 255, 0, 0.1) 50%,
    transparent 70%);
  filter: blur(100px);
  animation: rotate3d 30s linear infinite;
  pointer-events: none;
}

.element-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle at center,
    rgba(255, 255, 255, 0.8) 0%,
    transparent 70%);
  opacity: 0.2;
  filter: blur(5px);
  animation: pulse 2s ease-in-out infinite;
}

.button-text {
  position: relative;
  z-index: 1;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: neonPulse 2s infinite;
}

.button-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle at center,
    rgba(255, 0, 255, 0.5) 0%,
    rgba(0, 255, 255, 0.5) 50%,
    transparent 70%);
  opacity: 0;
  filter: blur(10px);
  transition: opacity 0.3s ease;
}

.cta-button:hover .button-glow {
  opacity: 1;
}

.mouse-glow {
  position: absolute;
  inset: -5px;
  background: radial-gradient(circle at center,
    rgba(255, 255, 255, 0.5) 0%,
    transparent 70%);
  opacity: 0.5;
  filter: blur(3px);
  animation: pulse 2s ease-in-out infinite;
}

.background-elements {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.background-element {
  position: absolute;
  width: var(--size);
  height: var(--size);
  left: var(--x);
  top: var(--y);
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  opacity: 0.1;
  filter: blur(20px);
  animation: float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}

// Добавляем новые медиа-запросы для лучшей адаптивности
@media (max-width: 480px) {
  .hero-content {
    padding: 1rem;
  }

  .glitch-text {
    font-size: clamp(1.8rem, 6vw, 2.5rem);
  }

  .cta-button {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .floating-elements {
    display: none;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .hero-content {
    padding: 1.5rem;
  }

  .glitch-text {
    font-size: clamp(2rem, 7vw, 4rem);
  }
}

@media (min-width: 1025px) {
  .hero-content {
    max-width: 1400px;
    margin: 0 auto;
  }
}

// Добавляем поддержку тёмной темы
@media (prefers-color-scheme: dark) {
  .hero-section {
    background: linear-gradient(45deg, #000000, #0a0a0a);
  }

  .glitch-text {
    text-shadow:
      0.05em 0 0 #00fffc,
      -0.03em -0.04em 0 #fc00ff,
      0.025em 0.04em 0 #fffc00,
      0 0 10px rgba(255, 255, 255, 0.5);
  }
}

// Добавляем поддержку уменьшенного движения
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// Добавляем поддержку высокой контрастности
@media (forced-colors: active) {
  .hero-section {
    border: 2px solid CanvasText;
  }

  .cta-button {
    border: 2px solid CanvasText;
    forced-color-adjust: none;
  }

  .glitch-text {
    forced-color-adjust: none;
  }
}

@keyframes glitch {
  0% {
    text-shadow:
      0.05em 0 0 #00fffc,
      -0.03em -0.04em 0 #fc00ff,
      0.025em 0.04em 0 #fffc00;
  }
  15% {
    text-shadow:
      0.05em 0 0 #00fffc,
      -0.03em -0.04em 0 #fc00ff,
      0.025em 0.04em 0 #fffc00;
  }
  16% {
    text-shadow:
      -0.05em -0.025em 0 #00fffc,
      0.025em 0.035em 0 #fc00ff,
      -0.05em -0.05em 0 #fffc00;
  }
  49% {
    text-shadow:
      -0.05em -0.025em 0 #00fffc,
      0.025em 0.035em 0 #fc00ff,
      -0.05em -0.05em 0 #fffc00;
  }
  50% {
    text-shadow:
      0.05em 0.035em 0 #00fffc,
      0.03em 0 0 #fc00ff,
      0 -0.04em 0 #fffc00;
  }
  99% {
    text-shadow:
      0.05em 0.035em 0 #00fffc,
      0.03em 0 0 #fc00ff,
      0 -0.04em 0 #fffc00;
  }
  100% {
    text-shadow:
      -0.05em 0 0 #00fffc,
      -0.025em -0.04em 0 #fc00ff,
      -0.04em -0.025em 0 #fffc00;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes scroll {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
}

@keyframes arrow {
  0% {
    opacity: 0;
    transform: rotate(45deg) translate(-5px, -5px);
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: rotate(45deg) translate(5px, 5px);
  }
}

@keyframes rotate3d {
  0% {
    transform: rotate3d(1, 1, 1, 0deg);
  }
  100% {
    transform: rotate3d(1, 1, 1, 360deg);
  }
}

@keyframes wave {
  0% {
    transform: translateX(-100%) skewX(-15deg);
  }
  100% {
    transform: translateX(100%) skewX(-15deg);
  }
}

@keyframes neonPulse {
  0% {
    text-shadow:
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 15px #ff00ff,
      0 0 20px #ff00ff,
      0 0 25px #ff00ff;
  }
  50% {
    text-shadow:
      0 0 10px #fff,
      0 0 20px #fff,
      0 0 30px #00ffff,
      0 0 40px #00ffff,
      0 0 50px #00ffff;
  }
  100% {
    text-shadow:
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 15px #ff00ff,
      0 0 20px #ff00ff,
      0 0 25px #ff00ff;
  }
}

@keyframes glitch-anim-1 {
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

@keyframes glitch-anim-2 {
  0% {
    clip: rect(65px, 9999px, 100px, 0);
  }
  5% {
    clip: rect(52px, 9999px, 74px, 0);
  }
  10% {
    clip: rect(79px, 9999px, 85px, 0);
  }
  15% {
    clip: rect(75px, 9999px, 5px, 0);
  }
  20% {
    clip: rect(67px, 9999px, 61px, 0);
  }
  25% {
    clip: rect(14px, 9999px, 79px, 0);
  }
  30% {
    clip: rect(1px, 9999px, 66px, 0);
  }
  35% {
    clip: rect(86px, 9999px, 30px, 0);
  }
  40% {
    clip: rect(23px, 9999px, 98px, 0);
  }
  45% {
    clip: rect(85px, 9999px, 72px, 0);
  }
  50% {
    clip: rect(71px, 9999px, 75px, 0);
  }
  55% {
    clip: rect(2px, 9999px, 48px, 0);
  }
  60% {
    clip: rect(30px, 9999px, 16px, 0);
  }
  65% {
    clip: rect(59px, 9999px, 50px, 0);
  }
  70% {
    clip: rect(41px, 9999px, 62px, 0);
  }
  75% {
    clip: rect(2px, 9999px, 82px, 0);
  }
  80% {
    clip: rect(47px, 9999px, 73px, 0);
  }
  85% {
    clip: rect(3px, 9999px, 27px, 0);
  }
  90% {
    clip: rect(26px, 9999px, 55px, 0);
  }
  95% {
    clip: rect(42px, 9999px, 97px, 0);
  }
  100% {
    clip: rect(38px, 9999px, 49px, 0);
  }
}

@keyframes borderGlow {
  0% {
    opacity: 0.5;
    filter: blur(5px) brightness(1);
  }
  50% {
    opacity: 1;
    filter: blur(8px) brightness(1.5);
  }
  100% {
    opacity: 0.5;
    filter: blur(5px) brightness(1);
  }
}

@keyframes noise {
  0% {
    transform: translate(0, 0);
  }
  10% {
    transform: translate(-5%, -5%);
  }
  20% {
    transform: translate(-10%, 5%);
  }
  30% {
    transform: translate(5%, -10%);
  }
  40% {
    transform: translate(-5%, 15%);
  }
  50% {
    transform: translate(-10%, 5%);
  }
  60% {
    transform: translate(15%, 0);
  }
  70% {
    transform: translate(0, 10%);
  }
  80% {
    transform: translate(3%, 15%);
  }
  90% {
    transform: translate(-10%, 10%);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>
