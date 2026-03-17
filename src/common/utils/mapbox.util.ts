export function buildStaticMapUrl(params: {
  accessToken: string;
  lostLatitude: number;
  lostLongitude: number;
  foundLatitude: number;
  foundLongitude: number;
}): string {
  const lostMarker = `pin-s-l+e63946(${params.lostLongitude},${params.lostLatitude})`;
  const foundMarker = `pin-s-f+1d3557(${params.foundLongitude},${params.foundLatitude})`;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lostMarker},${foundMarker}/auto/640x360?padding=80&access_token=${params.accessToken}`;
}
