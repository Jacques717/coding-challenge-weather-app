import { defineStore } from 'pinia'

export const useTempUnitStore = defineStore('tempUnit', {
  state: () => ({
    isCelsius: true
  }),

  actions: {
    toggleUnit() {
      this.isCelsius = !this.isCelsius
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