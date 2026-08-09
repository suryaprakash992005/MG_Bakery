// Location & Delivery Area Validation Service for M.G. Iyengar Bakery & Chats

export interface GeoLocationResult {
  latitude: number;
  longitude: number;
  addressLine?: string;
  streetArea?: string;
  landmark?: string;
  city?: string;
  pincode?: string;
  error?: string;
}

export interface DeliveryAreaValidation {
  isValid: boolean;
  distanceKm: number;
  message: string;
  areaName: string;
}

// Mohanur Center Coordinates (Namakkal, Tamil Nadu)
export const MOHANUR_CENTER = {
  latitude: 11.0619375,
  longitude: 78.1379375,
  pincode: '637015',
  areaName: 'Mohanur'
};

// Maximum Delivery Radius in Kilometers from Mohanur shop
export const DEFAULT_MAX_DELIVERY_RADIUS_KM = 15;

/**
 * Calculates distance in kilometers between two lat/lng coordinates using the Haversine formula
 */
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number = MOHANUR_CENTER.latitude,
  lon2: number = MOHANUR_CENTER.longitude
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
};

/**
 * Validates if the customer location falls within Mohanur delivery boundary
 */
export const validateMohanurDeliveryArea = (
  lat?: number,
  lng?: number,
  addressText?: string,
  pincode?: string,
  city?: string,
  maxRadiusKm: number = DEFAULT_MAX_DELIVERY_RADIUS_KM
): DeliveryAreaValidation => {
  // 1. Coordinates check if lat & lng are available
  if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
    const distanceKm = calculateDistanceKm(lat, lng);
    if (distanceKm <= maxRadiusKm) {
      return {
        isValid: true,
        distanceKm,
        areaName: MOHANUR_CENTER.areaName,
        message: `Delivery available in Mohanur (${distanceKm} km from shop)`
      };
    } else {
      return {
        isValid: false,
        distanceKm,
        areaName: MOHANUR_CENTER.areaName,
        message: `Sorry, home delivery is currently available only within Mohanur (${distanceKm} km from shop).`
      };
    }
  }

  // 2. Manual text address fallback check
  const textToScan = `${addressText || ''} ${city || ''} ${pincode || ''}`.toLowerCase();
  
  if (textToScan.includes('mohanur') || textToScan.includes('637015')) {
    return {
      isValid: true,
      distanceKm: 2,
      areaName: MOHANUR_CENTER.areaName,
      message: 'Delivery available in Mohanur'
    };
  }

  if (pincode && pincode.trim().length === 6 && pincode.trim() !== '637015') {
    return {
      isValid: false,
      distanceKm: 25,
      areaName: MOHANUR_CENTER.areaName,
      message: 'Sorry, home delivery is currently available only within Mohanur (Pincode 637015).'
    };
  }

  // If text doesn't contain Mohanur but no explicit bad pincode, allow user to confirm
  return {
    isValid: true,
    distanceKm: 0,
    areaName: MOHANUR_CENTER.areaName,
    message: 'Delivery available in Mohanur'
  };
};

/**
 * Prompts user for browser geolocation permission and returns coordinates
 */
export const getCurrentCoordinates = (): Promise<GeoLocationResult> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: 0,
        longitude: 0,
        error: 'Geolocation is not supported by your browser. Please enter address manually.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim
          const addressData = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            ...addressData
          });
        } catch {
          resolve({
            latitude,
            longitude,
            addressLine: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`,
            city: 'Mohanur',
            pincode: '637015'
          });
        }
      },
      (err) => {
        let errorMsg = 'Could not detect location. Please enter your address manually.';
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please enter your address manually.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable. Please enter your address manually.';
        } else if (err.code === err.TIMEOUT) {
          errorMsg = 'Location request timed out. Please enter your address manually.';
        }

        resolve({
          latitude: 0,
          longitude: 0,
          error: errorMsg
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
};

/**
 * Reverse geocodes coordinates to a human-readable Tamil Nadu / Mohanur address
 */
export const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<Partial<GeoLocationResult>> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en'
        }
      }
    );
    if (!res.ok) throw new Error('Geocoding request failed');
    const data = await res.json();
    const addr = data.address || {};

    const streetArea = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
    const city = addr.city || addr.town || addr.village || addr.county || 'Mohanur';
    const pincode = addr.postcode || '637015';
    const landmark = addr.amenity || addr.shop || addr.building || '';

    const addressParts = [
      streetArea,
      landmark,
      city,
      pincode
    ].filter(Boolean);

    return {
      addressLine: addressParts.join(', '),
      streetArea,
      landmark,
      city,
      pincode
    };
  } catch (error) {
    console.warn('Reverse geocoding fallback triggered:', error);
    return {
      addressLine: 'Mohanur, Namakkal',
      city: 'Mohanur',
      pincode: '637015'
    };
  }
};
