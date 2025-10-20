import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import { LatLngExpression, icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './PropertyMap.module.sass';

// Фикс для иконок маркеров в Leaflet
const DefaultIcon = icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface PropertyMapProps {
    address?: string;
    postalCode?: string;
    city?: string;
    className?: string;
    height?: string;
}

interface Coordinates {
    lat: number;
    lng: number;
}

// Координаты центра Италии (Рим)
const ITALY_CENTER: Coordinates = {
    lat: 41.8719,
    lng: 12.5674
};

// Основные города Италии для быстрого геокодирования
const MAJOR_CITIES: Record<string, Coordinates> = {
    'milano': { lat: 45.4642, lng: 9.1900 },
    'roma': { lat: 41.9028, lng: 12.4964 },
    'napoli': { lat: 40.8518, lng: 14.2681 },
    'torino': { lat: 45.0703, lng: 7.6869 },
    'firenze': { lat: 43.7696, lng: 11.2558 },
    'bologna': { lat: 44.4949, lng: 11.3426 },
    'genova': { lat: 44.4056, lng: 8.9463 },
    'palermo': { lat: 38.1157, lng: 13.3615 },
    'bari': { lat: 41.1171, lng: 16.8719 },
    'catania': { lat: 37.5079, lng: 15.0830 },
    'venezia': { lat: 45.4408, lng: 12.3155 },
    'verona': { lat: 45.4384, lng: 10.9916 },
    'messina': { lat: 38.1938, lng: 15.5540 },
    'padova': { lat: 45.4064, lng: 11.8768 },
    'trieste': { lat: 45.6495, lng: 13.7768 }
};

export const PropertyMap: React.FC<PropertyMapProps> = ({ 
    address, 
    postalCode,
    city, 
    className,
    height = '300px'
}) => {
    const [coordinates, setCoordinates] = useState<Coordinates>(ITALY_CENTER);
    const [loading, setLoading] = useState(false);
    const [lastSearchQuery, setLastSearchQuery] = useState<string>('');

    // Функция для получения координат по адресу
    const geocodeAddress = async (searchQuery: string): Promise<Coordinates | null> => {
        try {
            setLoading(true);
            
            // Сначала проверяем основные города
            const normalizedCity = searchQuery.toLowerCase().replace(/[àáâãäå]/g, 'a')
                .replace(/[èéêë]/g, 'e').replace(/[ìíîï]/g, 'i')
                .replace(/[òóôõö]/g, 'o').replace(/[ùúûü]/g, 'u');
            
            const cityMatch = Object.keys(MAJOR_CITIES).find(city => 
                normalizedCity.includes(city) || city.includes(normalizedCity)
            );
            
            if (cityMatch) {
                return MAJOR_CITIES[cityMatch];
            }

            // Если не нашли в основных городах, используем Nominatim OpenStreetMap
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Italy')}&limit=1&addressdetails=1`
            );
            
            if (!response.ok) {
                throw new Error('Geocoding request failed');
            }
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                return {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
            }
            
            return null;
        } catch (error) {
            console.warn('Geocoding failed:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Создаем составной поисковый запрос
    const createSearchQuery = (address?: string, postalCode?: string, city?: string): string => {
        const parts: string[] = [];
        
        if (address && address.trim()) {
            parts.push(address.trim());
        }
        
        if (postalCode && postalCode.trim()) {
            parts.push(postalCode.trim());
        }
        
        if (city && city.trim()) {
            parts.push(city.trim());
        }
        
        return parts.join(', ');
    };

    useEffect(() => {
        const searchQuery = createSearchQuery(address, postalCode, city);
        
        // Не обновляем, если запрос не изменился или слишком короткий
        if (!searchQuery || searchQuery.length < 3 || searchQuery === lastSearchQuery) {
            return;
        }
        
        // Дебаунсинг - ждем 1 секунду после изменения
        const timeoutId = setTimeout(async () => {
            setLastSearchQuery(searchQuery);
            
            const coords = await geocodeAddress(searchQuery);
            if (coords) {
                setCoordinates(coords);
            } else {
                // Если не нашли по полному адресу, пробуем только по городу
                if (city && city.trim()) {
                    const cityCoords = await geocodeAddress(city.trim());
                    if (cityCoords) {
                        setCoordinates(cityCoords);
                    } else {
                        setCoordinates(ITALY_CENTER);
                    }
                } else {
                    setCoordinates(ITALY_CENTER);
                }
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [address, postalCode, city, lastSearchQuery]);

    const position: LatLngExpression = [coordinates.lat, coordinates.lng];
    
    // Определяем зум в зависимости от типа адреса
    const getZoomLevel = () => {
        if (address && address.trim() && postalCode && postalCode.trim()) {
            return 16; // Полный адрес с почтовым кодом
        }
        if (address && address.trim()) {
            return 15; // Только адрес
        }
        if (city && city.trim()) {
            return 12; // Только город
        }
        return 6; // Центр Италии
    };
    
    return (
        <div className={`${styles['property-map']} ${className || ''}`} style={{ height }}>
            {loading && (
                <div className={styles['loading-overlay']}>
                    <div className={styles['loading-spinner']}>Caricamento mappa...</div>
                </div>
            )}
            
            <MapContainer
                center={position}
                zoom={getZoomLevel()}
                scrollWheelZoom={true}
                zoomControl={false}
                className={styles['leaflet-container']}
                key={`${coordinates.lat}-${coordinates.lng}`} // Принудительно перерисовываем карту при изменении координат
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={DefaultIcon} />
                <ZoomControl position="topright" />
            </MapContainer>
        </div>
    );
};
