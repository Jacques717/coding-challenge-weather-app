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
        <h1 class="text-2xl mb-1">{{ cityName }}</h1>
        <div class="text-sm text-blue-100 mb-4 opacity-80">{{ locationDetail }}</div>
        
        <!-- Location image -->
        <div v-if="locationImageUrl" class="relative mb-6 rounded-2xl overflow-hidden shadow-lg">
          <img 
            :src="locationImageUrl" 
            :alt="cityName"
            class="w-full h-[200px] object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
        </div>

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
            <div class="text-sm font-medium">{{ index === 0 ? 'Now' : formatTime(times[index]) }}</div>
            <div v-html="getWeatherIcon(weatherCodes[index])" class="mx-auto"></div>
            <div class="text-2xl font-light">{{ formatTemp(temp) }}°</div>
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
              <span class="text-sm w-8">{{ formatTemp(dailyLows[index]) }}°</span>
              <div class="flex-1 h-1 rounded-full bg-blue-400/30 relative">
                <div class="absolute h-1 bg-white rounded-full"
                     :style="`left: ${getTempPercent(dailyLows[index], index)}%; right: ${100 - getTempPercent(dailyHighs[index], index)}%`">
                </div>
              </div>
              <span class="text-sm w-8">{{ formatTemp(dailyHighs[index]) }}°</span>
            </div>
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
import { ref, onMounted, watch } from 'vue'

definePageMeta({
  name: 'weather'
})

const loading = ref(true)
const error = ref<string | null>(null)
const temperatures = ref<number[]>([])
const times = ref<string[]>([])
const cityName = ref('Loading...')
const isCelsius = ref(true)
const weatherCodes = ref<number[]>([])
const dailyHighs = ref<number[]>([])
const dailyLows = ref<number[]>([])
const dailyTimes = ref<string[]>([])
const locationDetail = ref('')
const locationImageUrl = ref('')

// Add a retry counter
let retryCount = 0;
const MAX_RETRIES = 3;

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

// Update fetchWeatherData to handle retries
async function fetchWeatherData(useRandom = false) {
  try {
    loading.value = true
    error.value = null
    
    const coords = useRandom ? getRandomLocation() : await getLocation()
    
    try {
      cityName.value = await getCityName(coords.lat, coords.lon)
    } catch (geocodeError) {
      // If we get a geocoding error and we're using random coordinates
      if (useRandom && retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retry attempt ${retryCount} of ${MAX_RETRIES}`);
        return fetchWeatherData(true); // Try again with new random coordinates
      } else {
        retryCount = 0; // Reset counter
        throw new Error('Could not find a valid location. Please try again.');
      }
    }
    
    // Reset retry counter on success
    retryCount = 0;
    
    // Get local timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    
    const response = await fetch(
      `http://localhost:3001/api/weather?latitude=${coords.lat}&longitude=${coords.lon}&timezone=${timezone}`
    )
    if (!response.ok) throw new Error('Failed to fetch weather data')
    
    const data = await response.json()
    temperatures.value = data.hourly.temperature_2m
    times.value = data.hourly.time
    weatherCodes.value = data.hourly.weathercode
    dailyHighs.value = data.daily.temperature_2m_max
    dailyLows.value = data.daily.temperature_2m_min
    dailyTimes.value = data.daily.time
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

// Load saved data on mount
onMounted(async () => {
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
  }
  await fetchWeatherData()
})

// Save data when it changes
watch([temperatures, times, weatherCodes, dailyHighs, dailyLows, dailyTimes, cityName, locationDetail], () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    temperatures: temperatures.value,
    times: times.value,
    weatherCodes: weatherCodes.value,
    dailyHighs: dailyHighs.value,
    dailyLows: dailyLows.value,
    dailyTimes: dailyTimes.value,
    cityName: cityName.value,
    locationDetail: locationDetail.value
  }))
}, { deep: true })
</script> 