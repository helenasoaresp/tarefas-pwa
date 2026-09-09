export function extractAddressLabel(address) {
  if (!address) return null

  return (
    address.label ||
    address.display_name ||
    address.address?.road ||
    address.address?.street ||
    null
  )
}

export function locationCacheKey(latitude, longitude) {
  if (latitude == null || longitude == null) {
    return null
  }

  return `${Number(latitude).toFixed(5)},${Number(longitude).toFixed(5)}`
}

export function buildLocationPayload(location) {
  if (!location) {
    return {
      latitude: null,
      longitude: null,
      geolocation_accuracy: null,
      geolocation_timestamp: null,
      location_label: null,
    }
  }

  return {
    latitude: location.latitude ?? null,
    longitude: location.longitude ?? null,
    geolocation_accuracy:
      location.accuracy ?? null,

    geolocation_timestamp: location.timestamp
      ? new Date(location.timestamp).toISOString()
      : null,

    location_label:
      location.label ?? null,
  }
}
