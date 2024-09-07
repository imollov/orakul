import { asJob } from '../core/job'

/**
 * Fetches weather data from an API using latitude and longitude and returns the temperature.
 */
export const weatherDataJob = asJob<[string, string], string>({
  name: 'Get Weather Data from API',
  inputTypes: ['string', 'string'],
  outputTypes: ['string'],
  fn: async ([lat, long]) => {
    console.log(`ℹ️ Getting weather data from API for lat: ${lat} and long: ${long}`)

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current=temperature_2m`,
    )
    const data = await response.json()
    const temperature = data.current.temperature_2m

    console.log(`ℹ️ Current temperature: ${temperature}`)

    return String(temperature)
  },
})
