import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DateTime } from "luxon";
import "leaflet/dist/leaflet.css";
import "antd/dist/reset.css";
import { Layout, Card, Spin, Typography, Input, Button, message } from "antd";
import L from "leaflet";
import "./App.css";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [ipInfo, setIpInfo] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIpInfo();
  }, []);

  const fetchIpInfo = async (ip = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://geo.ipify.org/api/v2/country,city?apiKey=${import.meta.env.VITE_IPIFY_API_KEY}&ipAddress=${ip}`
      );
      console.log("IP Info Response:", response.data);
      setIpInfo(response.data);

      const countryResponse = await axios.get(
        `https://restcountries.com/v3.1/alpha/${response.data.location.country}`
      );
      console.log("Country Info Response:", countryResponse.data[0]);
      setCountryInfo(countryResponse.data[0]);
    } catch (error) {
      console.error("Error fetching IP information:", error);
      message.error("Failed to fetch IP information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationInfo = async (location) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      if (response.data.features.length === 0) {
        throw new Error("Location not found");
      }
      const { lat, lon } = response.data.features[0].center;
      console.log("Location Coordinates:", lat, lon);
  
      // Fetch IP information based on coordinates
      const ipResponse = await axios.get(
        `https://geo.ipify.org/api/v2/country,city?apiKey=${import.meta.env.VITE_IPIFY_API_KEY}&latitude=${lat}&longitude=${lon}`
      );
      console.log("IP Info for Location Response:", ipResponse.data);
      setIpInfo(ipResponse.data);
  
      const countryResponse = await axios.get(
        `https://restcountries.com/v3.1/alpha/${ipResponse.data.location.country}`
      );
      console.log("Country Info for Location Response:", countryResponse.data[0]);
      setCountryInfo(countryResponse.data[0]);
    } catch (error) {
      console.error("Error fetching location information:", error);
      message.error("Failed to fetch location information. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleSearch = () => {
    // Check if the searchQuery is an IP address or location name
    if (searchQuery.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
      fetchIpInfo(searchQuery);
    } else {
      fetchIpInfo(searchQuery);
    }
  };

  if (loading || !ipInfo || !countryInfo) {
    return (
      <Layout className="layout">
        <Content style={{ padding: "50px", textAlign: "center" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  const {
    ip,
    location: { city, country, lat, lng, timezone },
  } = ipInfo;

  const animatedIcon = new L.Icon({
    iconUrl: "/wired-flat-18-location-pin.gif",
    iconSize: [50, 50], 
    iconAnchor: [25, 50], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -50], // Point from which the popup should open relative to the iconAnchor
  });

  return (
    <Layout className="layout">
      <Header className="header">
        <Title style={{ color: "white" }}>IP Information</Title>
      </Header>
      <Content className="content">
        <div className="ip-info-container">
          <div className="search-container">
            <Input
              placeholder="Enter IP address or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300, marginRight: 10 }}
            />
            <Button type="primary" onClick={handleSearch}>
              Search
            </Button>
          </div>
          <Card title="IP Information">
            <p>
              <Text strong>IP Address:</Text> {ip}
            </p>
            <p>
              <Text strong>Location:</Text> {city}, {country}
            </p>
            <p>
              <Text strong>Latitude:</Text> {lat}, <Text strong>Longitude:</Text>{" "}
              {lng}
            </p>
            <p>
              <Text strong>Timezone:</Text> {timezone}
            </p>
            <p>
              <Text strong>Local Time:</Text>{" "}
              {DateTime.now().setZone(timezone).toFormat("ff")}
            </p>
            <p>
              <Text strong>Country:</Text> {countryInfo.name.common}
            </p>
            <p>
              <Text strong>Language:</Text>{" "}
              {Object.values(countryInfo.languages).join(", ")}
            </p>
            <p>
              <Text strong>Country Flag:</Text>
              <br />
              <img
                src={countryInfo.flags.svg}
                alt={`Flag of ${countryInfo.name.common}`}
                width="100"
              />
            </p>
          </Card>
        </div>
        <div className="map-container">
          <MapContainer center={[lat, lng]} zoom={13} className="map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              
            />
            <Marker position={[lat, lng]} icon={animatedIcon}>
              <Popup>
                {city}, {country}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </Content>
    </Layout>
  );
}

export default App;
