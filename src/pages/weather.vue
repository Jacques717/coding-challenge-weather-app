<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-6 text-white">
    <div class="max-w-md mx-auto">
      <!-- Current Weather -->
      <div class="text-center mb-12">
        <h1 class="text-2xl mb-2">Seattle</h1>
        <div class="text-8xl font-light mb-4">{{ temperatures[0] }}°</div>
        <div class="text-xl">
          Feels Like: {{ temperatures[0] }}°
        </div>
        <div class="text-lg">
          H:{{ Math.max(...temperatures) }}° L:{{ Math.min(...temperatures) }}°
        </div>
      </div>

      <!-- Hourly Forecast -->
      <div class="bg-blue-500/30 backdrop-blur-sm rounded-3xl p-6 mb-6">
        <div class="grid grid-cols-6 gap-4 text-center">
          <div v-for="(temp, index) in temperatures.slice(0, 6)" :key="index" class="space-y-2">
            <div class="text-sm">{{ formatTime(times[index]) }}</div>
            <div class="text-xl">{{ temp }}°</div>
          </div>
        </div>
      </div>

      <!-- Daily Forecast -->
      <div class="bg-blue-500/30 backdrop-blur-sm rounded-3xl p-6">
        <h2 class="text-xl mb-4">10-Day Forecast</h2>
        <div class="space-y-4">
          <div v-for="(temp, index) in temperatures.slice(0, 10)" :key="index" 
               class="flex items-center justify-between">
            <span>{{ formatDay(times[index]) }}</span>
            <span>{{ temp }}°</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading and Error States -->
    <div v-if="loading" class="text-center py-12">
      Loading weather data...
    </div>
    <div v-if="error" class="text-center py-12 text-red-200">
      {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  name: 'weather'
})

const loading = ref(true)
const error = ref<string | null>(null)
const temperatures = ref<number[]>([])
const times = ref<string[]>([])

// Seattle coordinates
const DEFAULT_LAT = 47.6062
const DEFAULT_LON = -122.3321

function formatTime(timeString: string): string {
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  }).toUpperCase()
}

function formatDay(timeString: string): string {
  return new Date(timeString).toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

async function fetchWeatherData() {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(`http://localhost:3001/api/weather?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LON}`)
    if (!response.ok) throw new Error('Failed to fetch weather data')
    
    const data = await response.json()
    temperatures.value = data.hourly.temperature_2m
    times.value = data.hourly.time
  } catch (err) {
    error.value = 'Error loading weather data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchWeatherData()
})
</script> 