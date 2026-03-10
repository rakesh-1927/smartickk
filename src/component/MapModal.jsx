import { useState, useRef } from "react";
import { toast } from "react-hot-toast"; // Changed from react-toastify
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_LOCATION = { lat: 21.1592, lng: 79.0806, name: "Default Location" };

const MapModal = ({ onClose, onSelectLocation }) => {
  const [detectLoading, setDetectLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(DEFAULT_LOCATION);
  const [locationName, setLocationName] = useState(DEFAULT_LOCATION.name);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

    const reverseGeocode = async (lat, lon) => {
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
        params: { format: "json", lat, lon },
        // REMOVED the 'headers' property entirely to fix the error
      });
      return response.data.display_name || "Unknown location";
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Unknown location";
    }
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const name = await reverseGeocode(lat, lng);
        setSelectedPosition({ lat, lng });
        setLocationName(name);
        onSelectLocation(name, { lat, lng });
        if (mapRef.current) mapRef.current.flyTo([lat, lng], 15);
        if (markerRef.current) markerRef.current.openPopup();
      },
    });
    return null;
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported.");
      return;
    }
    setDetectLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const name = await reverseGeocode(latitude, longitude);
        const newPosition = { lat: latitude, lng: longitude };
        setSelectedPosition(newPosition);
        setLocationName(name);
        onSelectLocation(name, newPosition);
        if (mapRef.current) mapRef.current.flyTo([latitude, longitude], 15);
        setDetectLoading(false);
      },
      (error) => {
        toast.error(error.message);
        setDetectLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onSelectLocation(locationName, selectedPosition);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-4/5 h-4/5 shadow-xl flex flex-col relative">
        <h2 className="text-xl font-bold mb-4 text-center">Select Location</h2>
        <div className="relative flex-1">
          {detectLoading && <div className="absolute inset-0 z-[1000] bg-white/70 flex items-center justify-center">Loading...</div>}
          <MapContainer
            center={[selectedPosition.lat, selectedPosition.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => (mapRef.current = map)}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler />
            <Marker position={[selectedPosition.lat, selectedPosition.lng]} ref={markerRef}>
              <Popup>{locationName}</Popup>
            </Marker>
          </MapContainer>
          <button onClick={handleDetectLocation} className="absolute top-4 right-4 z-[1000] bg-blue-600 text-white px-4 py-2 rounded shadow">
            Detect My Location
          </button>
        </div>
        <div className="mt-4 flex justify-between">
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={handleConfirm} className="bg-green-500 text-white px-4 py-2 rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;