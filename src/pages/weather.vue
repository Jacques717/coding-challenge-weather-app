<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 p-6 text-white">
    <!-- Loading State -->
    <div v-if="loading" class="max-w-md mx-auto text-center py-8">
      <div class="mb-4">
        <img 
          src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/wind.svg" 
          class="w-16 h-16 mx-auto"
          alt="Loading..."
        />
      </div>
      <div class="text-xl font-medium">
        Loading weather data...
      </div>
    </div>

    <!-- Error State with Refresh Button -->
    <div v-if="error" class="max-w-md mx-auto text-center">
      <div class="py-8 text-xl font-medium text-red-200">
        {{ error }}
      </div>
      <button 
        @click="fetchWeatherData(true)"
        class="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-full p-4 transition-colors inline-flex items-center gap-2"
        :disabled="loading || loadingRandom"
      >
        <img 
          v-if="loadingRandom"
          src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/wind.svg" 
          class="w-6 h-6"
          alt="Loading..."
        />
        <svg 
          v-else
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ loadingRandom ? 'Loading...' : 'Try Another Location' }}
      </button>
    </div>

    <!-- Main Content -->
    <div v-if="!loading && !error" class="max-w-md mx-auto relative">
      <!-- Temperature toggle button -->
      <button 
        @click="tempStore.toggleUnit"
        class="absolute top-0 left-0 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors w-10 h-10 flex items-center justify-center"
        title="Toggle temperature unit"
      >
        <span class="text-lg font-medium">{{ tempStore.isCelsius ? '°C' : '°F' }}</span>
      </button>

      <!-- Random location button -->
      <button 
        @click="fetchWeatherData(true)"
        class="absolute top-0 right-0 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
        :disabled="loadingRandom"
      >
        <img 
          v-if="loadingRandom"
          src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/wind.svg" 
          class="w-6 h-6"
          alt="Loading..."
        />
        <svg 
          v-else
          xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      <!-- Manual coordinate input button -->
      <button 
        @click="showCoordInput = true"
        class="absolute top-0 right-14 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
        title="Enter coordinates manually"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      <!-- Current Weather -->
      <div class="text-center mb-12">
        <h1 class="text-2xl mb-1">{{ cityName }}</h1>
        <div class="text-sm text-blue-100 mb-4 opacity-80">{{ locationDetail }}</div>
        
        <!-- Location image with overlaid weather info -->
        <div class="relative mb-6 rounded-2xl overflow-hidden shadow-lg">
          <img 
            v-if="locationImageUrl"
            :src="locationImageUrl" 
            :alt="cityName"
            class="w-full h-[200px] object-cover"
          />
          <!-- Fallback background when no image -->
          <div v-else class="w-full h-[200px] bg-blue-500/30 backdrop-blur-sm"></div>
          
          <!-- Weather info overlay -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 flex flex-col justify-center items-center">
            <div class="text-8xl font-light mb-2">{{ tempStore.formatTemp(temperatures[0]) }}°</div>
            <div class="text-xl mb-1">
              Feels Like: {{ tempStore.formatTemp(temperatures[0]) }}°
            </div>
            <div class="text-lg">
              H:{{ tempStore.formatTemp(Math.max(...temperatures)) }}° 
              L:{{ tempStore.formatTemp(Math.min(...temperatures)) }}°
            </div>
          </div>
        </div>
      </div>

      <!-- Hourly Forecast -->
      <div class="bg-blue-500/30 backdrop-blur-sm rounded-3xl p-6 mb-6">
        <div class="grid grid-cols-6 gap-4">
          <div v-for="(temp, index) in temperatures.slice(0, 6)" :key="index" 
               class="flex flex-col items-center">
            <!-- Time -->
            <div class="text-base font-medium mb-2">
              {{ index === 0 ? 'Now' : formatTime(times[index]) }}
            </div>
            <!-- Weather Icon -->
            <div v-html="getWeatherIcon(weatherCodes[index])" 
                 class="mb-2"></div>
            <!-- Temperature -->
            <div class="text-2xl">
              {{ tempStore.formatTemp(temp) }}°
            </div>
          </div>
        </div>
      </div>

      <!-- Daily Forecast -->
      <div class="bg-blue-500/30 backdrop-blur-sm rounded-3xl p-6">
        <h2 class="text-xl mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 4h-2V3a1 1 0 00-2 0v1H9V3a1 1 0 00-2 0v1H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V8h14v12z"/>
          </svg>
          10-DAY FORECAST
        </h2>
        <div class="space-y-4">
          <div v-for="(_, index) in dailyHighs" :key="index" 
               class="flex items-center">
            <span class="w-12 font-medium">{{ formatDay(dailyTimes[index]) }}</span>
            <div v-html="getWeatherIcon(weatherCodes[index * 24])" class="mx-4"></div>
            <div class="flex-1 flex items-center gap-3">
              <span class="text-sm w-8">{{ tempStore.formatTemp(dailyLows[index]) }}°</span>
              <div class="flex-1 h-1 rounded-full bg-blue-400/30 relative">
                <div class="absolute h-1 bg-white rounded-full"
                     :style="`left: ${getTempPercent(dailyLows[index], index)}%; right: ${100 - getTempPercent(dailyHighs[index], index)}%`">
                </div>
              </div>
              <span class="text-sm w-8">{{ tempStore.formatTemp(dailyHighs[index]) }}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Coordinate input modal -->
    <div v-if="showCoordInput" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white text-gray-900 rounded-2xl p-6 max-w-sm w-full">
        <h3 class="text-xl font-semibold mb-4">Enter Coordinates</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input 
              v-model="manualLat"
              type="number" 
              step="any"
              placeholder="-90 to 90"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input 
              v-model="manualLon"
              type="number"
              step="any"
              placeholder="-180 to 180"
              class="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div class="flex gap-3 mt-6">
            <button 
              @click="submitCoordinates"
              class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              :disabled="!isValidCoords"
            >
              Submit
            </button>
            <button 
              @click="showCoordInput = false"
              class="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useTempUnitStore } from '@/stores/tempUnit'

definePageMeta({
  name: 'weather'
})

const loading = ref(true)
const error = ref<string | null>(null)
const temperatures = ref<number[]>([])
const times = ref<string[]>([])
const cityName = ref('Loading...')
const weatherCodes = ref<number[]>([])
const dailyHighs = ref<number[]>([])
const dailyLows = ref<number[]>([])
const dailyTimes = ref<string[]>([])
const locationDetail = ref('')
const locationImageUrl = ref('')

// Add a retry counter
let retryCount = 0;
const MAX_RETRIES = 3;

// Add new ref for random loading state
const loadingRandom = ref(false)

// Add these refs
const showCoordInput = ref(false)
const manualLat = ref('')
const manualLon = ref('')

// Add computed property for validation
const isValidCoords = computed(() => {
  const lat = Number(manualLat.value)
  const lon = Number(manualLon.value)
  return !isNaN(lat) && !isNaN(lon) && 
         lat >= -90 && lat <= 90 && 
         lon >= -180 && lon <= 180
})

// Get the temperature store
const tempStore = useTempUnitStore()

// Add a delay helper function
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Add this helper function to get current hour index
function getCurrentHourIndex(timeArray: string[]): number {
  const now = new Date()
  return timeArray.findIndex(time => {
    const timeDate = new Date(time)
    return timeDate.getHours() === now.getHours() &&
           timeDate.getDate() === now.getDate()
  })
}

// Update fetchWeatherData function
async function fetchWeatherData(useRandom = false, manualCoords?: {lat: number, lon: number}) {
  try {
    // Don't set loading to true if we have cached data
    const hasCache = temperatures.value.length > 0
    if (!hasCache) {
      loading.value = true
    }
    if (useRandom) loadingRandom.value = true
    error.value = null
    
    const minimumLoadingTime = delay(1000)
    
    const fetchDataPromise = (async () => {
      const coords = manualCoords || (useRandom ? { lat: 0, lon: 0 } : await getLocation())
      
      const response = await fetch(
        `http://localhost:3001/api/weather?latitude=${coords.lat}&longitude=${coords.lon}&random=${useRandom}`
      )
      if (!response.ok) throw new Error('Failed to fetch weather data')
      
      const data = await response.json()
      
      // Update location info from server response
      cityName.value = data.cityName || 'Unknown Location'
      locationDetail.value = data.locationDetail || ''
      locationImageUrl.value = data.imageUrl || ''
      
      if (data && data.hourly) {
        const currentHourIndex = getCurrentHourIndex(data.hourly.time)
        
        temperatures.value = data.hourly.temperature_2m.slice(currentHourIndex)
        times.value = data.hourly.time.slice(currentHourIndex)
        weatherCodes.value = data.hourly.weathercode.slice(currentHourIndex)
        dailyHighs.value = data.daily.temperature_2m_max
        dailyLows.value = data.daily.temperature_2m_min
        dailyTimes.value = data.daily.time
      }
      
      return data
    })()

    const [data] = await Promise.all([fetchDataPromise, minimumLoadingTime])
    
    if (data && data.hourly) {
      const currentHourIndex = getCurrentHourIndex(data.hourly.time)
      
      temperatures.value = data.hourly.temperature_2m.slice(currentHourIndex)
      times.value = data.hourly.time.slice(currentHourIndex)
      weatherCodes.value = data.hourly.weathercode.slice(currentHourIndex)
      dailyHighs.value = data.daily.temperature_2m_max
      dailyLows.value = data.daily.temperature_2m_min
      dailyTimes.value = data.daily.time
    }
  } catch (err) {
    if (!temperatures.value.length) {  // Only show error if we don't have cached data
      error.value = err instanceof Error ? err.message : 'Error loading weather data'
    }
    console.error(err)
  } finally {
    loading.value = false
    loadingRandom.value = false
  }
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

async function fetchLocationImage(location: string) {
  try {
    // First search for the Wikipedia page
    const searchResponse = await fetch(
      `https://en.wikipedia.org/w/api.php?` + 
      `action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(location)}`
    )
    const searchData = await searchResponse.json()
    
    if (searchData.query.search.length > 0) {
      const pageId = searchData.query.search[0].pageid
      
      // Then get the page images
      const imageResponse = await fetch(
        `https://en.wikipedia.org/w/api.php?` +
        `action=query&format=json&origin=*&prop=pageimages&pithumbsize=500&pageids=${pageId}`
      )
      const imageData = await imageResponse.json()
      
      const page = imageData.query.pages[pageId]
      if (page.thumbnail) {
        locationImageUrl.value = page.thumbnail.source
      } else {
        // Try with region if city image not found
        const region = locationDetail.value.split(',')[0]
        await fetchLocationImage(region)
      }
    }
  } catch (error) {
    console.error('Failed to fetch location image:', error)
    locationImageUrl.value = ''
  }
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
  
  locationDetail.value = data.display_name
    .split(', ')
    .slice(1)
    .join(', ')
  
  const cityName = data.address.city || 
                  data.address.town || 
                  data.address.village || 
                  data.address.county ||
                  data.address.municipality ||
                  'Unknown Location'
  
  // Fetch image for the location
  await fetchLocationImage(cityName + ' ' + data.address.country)
  
  return cityName
}

// Update the weather icons to use animated SVGs from Meteocons
const weatherIcons = {
  clear: `<img src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/clear-day.svg" class="w-8 h-8" />`,
  cloudy: `<img src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/cloudy.svg" class="w-8 h-8" />`,
  rain: `<img src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/rain.svg" class="w-8 h-8" />`,
  snow: `<img src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/snow.svg" class="w-8 h-8" />`,
  thunderstorm: `<img src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/thunderstorms-rain.svg" class="w-8 h-8" />`
}

// Add this helper function
function getWeatherIcon(code: number): string {
  // WMO Weather interpretation codes
  switch (true) {
    case code === 0: // Clear sky
      return weatherIcons.clear
    case code >= 1 && code <= 3: // Partly cloudy
      return weatherIcons.cloudy
    case code >= 51 && code <= 67: // Drizzle and Rain
    case code >= 80 && code <= 82: // Rain showers
      return weatherIcons.rain
    case code >= 71 && code <= 77: // Snow
    case code >= 85 && code <= 86: // Snow showers
      return weatherIcons.snow
    case code >= 95 && code <= 99: // Thunderstorm
      return weatherIcons.thunderstorm
    default: // Cloudy, fog, etc
      return weatherIcons.cloudy
  }
}

// Add this function to calculate temperature percentage for the scale
function getTempPercent(temp: number, dayIndex: number): number {
  const allTemps = [...dailyLows.value, ...dailyHighs.value]
  const min = Math.min(...allTemps)
  const max = Math.max(...allTemps)
  const range = max - min
  return Math.round(((temp - min) / range) * 100)
}

// Add local storage functionality
const STORAGE_KEY = 'weather-app-data'

// Update onMounted function
onMounted(async () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      temperatures.value = data.temperatures
      times.value = data.times
      weatherCodes.value = data.weatherCodes
      dailyHighs.value = data.dailyHighs
      dailyLows.value = data.dailyLows
      dailyTimes.value = data.dailyTimes
      cityName.value = data.cityName
      locationDetail.value = data.locationDetail
      locationImageUrl.value = data.locationImageUrl
      
      // If we have cached data, show it immediately
      loading.value = false
    }

    // Try to fetch fresh data
    await fetchWeatherData()
  } catch (err) {
    // If fetch fails but we have cached data, don't show error
    if (!temperatures.value.length) {
      error.value = err instanceof Error ? err.message : 'Error loading weather data'
    }
    loading.value = false
  }
})

// Update the watch to save more data
watch([
  temperatures, times, weatherCodes, 
  dailyHighs, dailyLows, dailyTimes, 
  cityName, locationDetail, locationImageUrl
], () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    temperatures: temperatures.value,
    times: times.value,
    weatherCodes: weatherCodes.value,
    dailyHighs: dailyHighs.value,
    dailyLows: dailyLows.value,
    dailyTimes: dailyTimes.value,
    cityName: cityName.value,
    locationDetail: locationDetail.value,
    locationImageUrl: locationImageUrl.value
  }))
}, { deep: true })

// Add function to handle manual coordinates
async function submitCoordinates() {
  if (!isValidCoords.value) return
  
  showCoordInput.value = false
  await fetchWeatherData(false, {
    lat: Number(manualLat.value),
    lon: Number(manualLon.value)
  })
  
  // Reset inputs
  manualLat.value = ''
  manualLon.value = ''
}

// Add this function to get random coordinates
function getRandomLocation() {
  // Generate random latitude between -60 and 70 (most inhabited areas)
  const lat = Math.random() * 130 - 60;  // -60 to 70
  
  // Generate random longitude between -180 and 180
  const lon = Math.random() * 360 - 180;  // -180 to 180
  
  // Round to 4 decimal places for reasonable precision
  return {
    lat: Math.round(lat * 10000) / 10000,
    lon: Math.round(lon * 10000) / 10000
  }
}
</script> 