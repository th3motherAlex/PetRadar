import { Point } from 'geojson';

export function createPoint(longitude: number, latitude: number): Point {
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
}

export function getCoordinates(point: Point): { latitude: number; longitude: number } {
  const [longitude, latitude] = point.coordinates;

  return {
    latitude,
    longitude,
  };
}
