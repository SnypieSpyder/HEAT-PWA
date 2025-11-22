import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Modal } from './Modal';
import { Spinner } from './Spinner';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  title?: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export const LocationMapModal: React.FC<LocationMapModalProps> = ({
  isOpen,
  onClose,
  location,
  title,
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && location) {
      geocodeLocation(location);
    }
  }, [isOpen, location]);

  const geocodeLocation = async (address: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Using Nominatim (OpenStreetMap's geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to geocode location');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        setCoordinates({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        });
      } else {
        setError('Location not found. Please check the address.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Unable to load map. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || location}
      size="lg"
    >
      <div className="space-y-4">
        <div className="bg-neutral-50 p-3 rounded-lg">
          <p className="text-sm text-neutral-700">
            <span className="font-medium">Address:</span> {location}
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-96">
            <Spinner size="lg" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && coordinates && (
          <div className="h-96 rounded-lg overflow-hidden border border-neutral-300">
            <MapContainer
              center={[coordinates.lat, coordinates.lng]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[coordinates.lat, coordinates.lng]}>
                <Popup>{location}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <div className="text-center text-sm text-neutral-500">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 underline"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </Modal>
  );
};

