import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ bounds, position }) {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, {     //zooming korar jonno
                padding: [50, 50], 
                maxZoom: 16, 
                animate: true, 
                duration: 1.5 
            });
        } else if (position) {
            map.setView(position, 16, { animate: true });
        }
    }, [bounds, position, map]);
    return null;
}

export default function GlobeView({ pinCode }) {
    const [position, setPosition] = useState(null);
    const [bounds, setBounds] = useState(null);
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pinCode && pinCode.toString().length === 6) {
            fetchCoords(pinCode);
        }
    }, [pinCode]);

    const fetchCoords = async (pin) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pin}&country=India`
            );
            
            if (response.data.length > 0) {
                const data = response.data[0];
                const { lat, lon, display_name, boundingbox } = data;
                
                setPosition([parseFloat(lat), parseFloat(lon)]);
                setAddress(display_name);

                const areaBounds = [
                    [parseFloat(boundingbox[0]), parseFloat(boundingbox[2])],
                    [parseFloat(boundingbox[1]), parseFloat(boundingbox[3])]
                ];
                setBounds(areaBounds);
            }
        } catch (error) {
            console.error("Map Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[60vh] w-full bg-white rounded-xl overflow-hidden shadow-2xl relative border border-gray-200">
            {/* Loading Indicator */}
            {loading && (
                <div className="absolute inset-0 z-[2000] bg-white/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-white p-4 rounded-full shadow-lg border border-blue-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            )}

            <MapContainer 
                center={[22.5726, 88.3639]} 
                zoom={12} 
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                
                <TileLayer
                    attribution='&copy; Google'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                />

                {position && (
                    <>
                        <Marker position={position}>
                            <Popup>
                                <div className="text-sm font-sans">
                                    <strong className="text-blue-700">Land Location</strong><br />
                                    <span className="text-gray-600 text-xs">{address}</span>
                                </div>
                            </Popup>
                        </Marker>
                        <ChangeView bounds={bounds} position={position} />
                    </>
                )}
            </MapContainer>
        </div>
    );
}