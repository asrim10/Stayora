export interface GeocodeResult {
  coordinates: { lat: number; lng: number } | null;
  warning: string | null;
}

/** Minimum delay between Nominatim API calls (1 second to respect usage policy) */
const NOMINATIM_DELAY_MS = 1000;

async function tryGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const encoded = encodeURIComponent(query);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
    {
      headers: {
        "User-Agent": "Stayora/1.0", // Nominatim requires this
      },
    },
  );

  const data = await res.json();
  if (!data || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  };
}

export async function geocodeAddress(
  address: string,
  city: string,
  country: string,
): Promise<GeocodeResult> {
  // 1. Try full address first
  const fullCoords = await tryGeocode(`${address}, ${city}, ${country}`);
  if (fullCoords) return { coordinates: fullCoords, warning: null };

  // Pause 1s between requests to respect Nominatim rate limits
  await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS));

  // 2. Fallback: try city + country only
  const cityCoords = await tryGeocode(`${city}, ${country}`);
  if (cityCoords) {
    return {
      coordinates: cityCoords,
      warning: `Could not pinpoint exact address "${address}". Using approximate location for ${city}, ${country}. Edit the hotel to set precise coordinates if needed.`,
    };
  }

  // Pause another 1s before final attempt
  await new Promise((r) => setTimeout(r, NOMINATIM_DELAY_MS));

  // 3. Fallback: try city only
  const cityOnlyCoords = await tryGeocode(city);
  if (cityOnlyCoords) {
    return {
      coordinates: cityOnlyCoords,
      warning: `Could not find "${address}, ${city}, ${country}". Using approximate location for ${city}. Edit the hotel to set precise coordinates if needed.`,
    };
  }

  return {
    coordinates: null,
    warning: `Could not determine location for "${address}, ${city}, ${country}". Please add coordinates manually by editing the hotel.`,
  };
}
