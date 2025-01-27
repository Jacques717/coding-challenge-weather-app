import { defineStore } from 'pinia'
import { useCookie } from '#app'

export const useTempUnitStore = defineStore('tempUnit', {
  state: () => {
    // Use Nuxt's cookie helper with a default value
    const unitPreference = useCookie('temp-unit', {
      default: () => 'C',
      watch: true
    })
    return {
      isCelsius: unitPreference.value === 'C'
    }
  },

  actions: {
    toggleUnit() {
      this.isCelsius = !this.isCelsius
      // Update the cookie
      const unitPreference = useCookie('temp-unit')
      unitPreference.value = this.isCelsius ? 'C' : 'F'
    }
  },

  getters: {
    formatTemp: (state) => (temp: number) => {
      if (state.isCelsius) {
        return Math.round(temp)
      }
      return Math.round((temp * 9/5) + 32)
    }
  }
}) 