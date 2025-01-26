<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-6 text-white">
    <div class="max-w-md mx-auto relative">
      <!-- Add temperature toggle button -->
      <button 
        @click="isCelsius = !isCelsius"
        class="absolute top-0 left-0 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
      >
        {{ isCelsius ? '°C' : '°F' }}
      </button>

      <!-- Add this button at the top -->
      <button 
        @click="fetchWeatherData(true)"
        class="absolute top-0 right-0 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <!-- Current Weather -->
      <div class="text-center mb-12">
        <h1 class="text-2xl mb-2">{{ cityName }}</h1>
        <div class="text-8xl font-light mb-4">{{ formatTemp(temperatures[0]) }}°</div>
        <div class="text-xl">
          Feels Like: {{ formatTemp(temperatures[0]) }}°
        </div>
        <div class="text-lg">
          H:{{ formatTemp(Math.max(...temperatures)) }}° 
          L:{{ formatTemp(Math.min(...temperatures)) }}°
        </div>
      </div>

      <!-- Hourly Forecast -->
      <div class="bg-blue-500/30 backdrop-blur-sm rounded-3xl p-6 mb-6">
        <div class="grid grid-cols-6 gap-4 text-center">
          <div v-for="(temp, index) in temperatures.slice(0, 6)" :key="index" class="space-y-2">
            <div class="text-sm">{{ formatTime(times[index]) }}</div>
            <div class="text-xl">{{ formatTemp(temp) }}°</div>
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
            <span>{{ formatTemp(temp) }}°</span>
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
const cityName = ref('Loading...')
const isCelsius = ref(true)

// Add this array of major cities with their coordinates
const worldCities = [
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Rio', lat: -22.9068, lon: -43.1729 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 }
]

// Add this function to get random coordinates
function getRandomLocation() {
  const randomCity = worldCities[Math.floor(Math.random() * worldCities.length)]
  return { lat: randomCity.lat, lon: randomCity.lon }
}

async function getLocation(): Promise<{lat: number, lon: number}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation is not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (err) => {
        reject('Please enable location access')
      }
    )
  })
}

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

async function getCityName(lat: number, lon: number): Promise<string> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        'User-Agent': 'WeatherApp/1.0'
      }
    }
  )
  const data = await response.json()
  console.log('Location data:', data.address) // For debugging
  return data.address.city || 
         data.address.town || 
         data.address.village || 
         data.address.county ||
         data.address.municipality ||
         'Unknown Location'
}

// Update fetchWeatherData to accept optional coordinates
async function fetchWeatherData(useRandom = false) {
  try {
    loading.value = true
    error.value = null
    
    const coords = useRandom ? getRandomLocation() : await getLocation()
    cityName.value = await getCityName(coords.lat, coords.lon)
    
    const response = await fetch(
      `http://localhost:3001/api/weather?latitude=${coords.lat}&longitude=${coords.lon}`
    )
    if (!response.ok) throw new Error('Failed to fetch weather data')
    
    const data = await response.json()
    temperatures.value = data.hourly.temperature_2m
    times.value = data.hourly.time
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error loading weather data'
    console.error(err)
  } finally {
    loading.value = false
  }
}

function convertToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32)
}

function formatTemp(temp: number): number {
  return isCelsius.value ? Math.round(temp) : convertToFahrenheit(temp)
}

onMounted(() => {
  fetchWeatherData()
})
</script> 