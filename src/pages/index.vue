<template>
  <div class="container">
    <h1>Welcome</h1>
    <NuxtLink to="/weather" class="weather-link">
      Check Weather Forecast
    </NuxtLink>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.weather-link {
  display: inline-block;
  padding: 12px 24px;
  background-color: #2c3e50;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  margin-top: 20px;
  transition: background-color 0.2s;
}

.weather-link:hover {
  background-color: #34495e;
}
</style> 