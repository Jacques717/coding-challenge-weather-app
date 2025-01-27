export function getRandomLocation() {
  // Generate random latitude between -60 and 70 (most inhabited areas)
  const lat = Math.random() * 130 - 60;  // -60 to 70
  // Generate random longitude between -180 and 180
  const lon = Math.random() * 360 - 180;  // -180 to 180
  
  return {
    lat: Math.round(lat * 10000) / 10000,
    lon: Math.round(lon * 10000) / 10000
  };
} 