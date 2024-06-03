// src/App.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DateTime } from 'luxon';

const App = () => {
  const [ipData, setIpData] = useState(null);
  const [countryData, setCountryData] = useState(null);

  useEffect(() => {
    const fetchIPData = async () => {
      try {
        const response = await axios.get(`https://geo.ipify.org/api/v2/country,city?apiKey=${import.meta.env.VITE_IPIFY_API_KEY}`);
        setIpData(response.data);

        const countryResponse = await axios.get(`https://restcountries.com/v3.1/alpha/${response.data.location.country}`);
        setCountryData(countryResponse.data[0]);
      } catch (error) {
        console.error("Error fetching the IP or country data", error);
      }
    };

    fetchIPData();
  }, []);

  if (!ipData || !countryData) return <div>Loading...</div>;

  const localTime = DateTime.local().setZone(ipData.location.timezone).toLocaleString(DateTime.DATETIME_FULL);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>IP Information</h1>
      <p><strong>IP Address:</strong> {ipData.ip}</p>
      <p><strong>Location:</strong> {ipData.location.city}, {ipData.location.region}, {ipData.location.country}</p>
      <p><strong>Time Zone:</strong> {ipData.location.timezone}</p>
      <p><strong>ISP:</strong> {ipData.isp}</p>
      <p><strong>Local Time:</strong> {localTime}</p>
      <p><strong>Country Info:</strong></p>
      <img src={countryData.flags.svg} alt={`Flag of ${countryData.name.common}`} width="100" />
      <p><strong>Country Name:</strong> {countryData.name.common}</p>
      <p><strong>Population:</strong> {countryData.population}</p>
      <p><strong>Capital:</strong> {countryData.capital[0]}</p>

      <MapContainer center={[ipData.location.lat, ipData.location.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[ipData.location.lat, ipData.location.lng]}>
          <Popup>
            {ipData.location.city}, {ipData.location.region}, {ipData.location.country}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default App;
