<template>
  <div class="weather-container">
    <h1>Weather Forecast</h1>
    
    <div v-if="loading" class="loading">
      Loading weather data...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else class="weather-data">
      <div class="temperature-list">
        <div v-for="(temp, index) in temperatures" :key="index" class="temperature-item">
          <span class="time">{{ formatTime(times[index]) }}</span>
          <span class="temp">{{ temp }}°C</span>
        </div>
      </div>
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

// You might want to replace these with your actual location
const DEFAULT_LAT = 51.5074
const DEFAULT_LON = -0.1278

async function fetchWeatherData() {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(`/api/weather?latitude=${DEFAULT_LAT}&longitude=${DEFAULT_LON}`)
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

function formatTime(timeString: string): string {
  return new Date(timeString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fetch data when component mounts
onMounted(() => {
  fetchWeatherData()
})
</script>

<style scoped>
.weather-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
}

.error {
  color: red;
}

.temperature-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.temperature-item {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  color: #666;
}

.temp {
  font-weight: bold;
  color: #2c3e50;
}
</style> 