<script setup lang="ts">
import { ref } from 'vue'
import HeroSection from './components/HeroSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import InteractiveSection from './components/InteractiveSection.vue'
import ParallaxSection from './components/ParallaxSection.vue'
import MatrixSection from './components/MatrixSection.vue'
import CyberpunkPortal from './components/CyberpunkPortal.vue'
import SauronEye from './components/SauronEye.vue'
import CosmicPortal from './components/CosmicPortal.vue'
import NeuralNetwork from './components/NeuralNetwork.vue'
import VisibilityWrapper from './components/VisibilityWrapper.vue'
import GlobalEffects from './components/GlobalEffects.vue'
import TestPageSection from './components/TestPageSection.vue'
import CursorHunter from './components/CursorHunter.vue'

// Расширяем тип Window для smoothScrollAnimation
declare global {
  interface Window {
    smoothScrollAnimation?: number;
  }
}

const sections = [
  { component: HeroSection, name: 'hero', isActive: true },
  { component: FeaturesSection, name: 'features', isActive: false },
  { component: InteractiveSection, name: 'interactive', isActive: false },
  { component: ParallaxSection, name: 'parallax', isActive: false },
  { component: MatrixSection, name: 'matrix', isActive: false },
  { component: CyberpunkPortal, name: 'cyberpunk', isActive: false },
  { component: SauronEye, name: 'sauron', isActive: false },
  { component: CosmicPortal, name: 'cosmic', isActive: false },
  { component: NeuralNetwork, name: 'neural', isActive: false }
]

const currentSection = ref('hero')

const handleVisibilityChange = (isVisible: boolean, sectionName: string) => {
  if (isVisible) {
    currentSection.value = sectionName
  }
  const section = sections.find(s => s.name === sectionName)
  if (section) {
    section.isActive = isVisible
  }
}
</script>

<template>
  <div class="app">
    <CursorHunter />
    <GlobalEffects :current-section="currentSection" />
    <VisibilityWrapper
      v-for="section in sections"
      :key="section.name"
      :section-name="section.name"
      @visibility-change="handleVisibilityChange"
    >
      <component
        :is="section.component"
        :is-active="section.isActive"
      />
    </VisibilityWrapper>
    <TestPageSection />
  </div>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  background: #000;
  color: white;
  line-height: 1.5;
}

.app {
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 0, 255, 0.5) rgba(0, 0, 0, 0.2);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    border-radius: 4px;

    &:hover {
      background: linear-gradient(45deg, #ff00ff, #00ffff);
      opacity: 0.8;
    }
  }
}

// Глобальные стили для анимаций
.v-motion-slide-bottom-enter-active,
.v-motion-slide-bottom-leave-active,
.v-motion-slide-top-enter-active,
.v-motion-slide-top-leave-active,
.v-motion-slide-left-enter-active,
.v-motion-slide-left-leave-active,
.v-motion-slide-right-enter-active,
.v-motion-slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

// Стили для выделения текста
::selection {
  background: rgba(255, 0, 255, 0.3);
  color: white;
}

// Добавляем плавные переходы для секций
section {
  transition: opacity 0.3s ease;
  will-change: opacity;
  
  &[data-section] {
    opacity: 1;
  }
  
  &.section-placeholder {
    opacity: 0;
  }
}
</style>
