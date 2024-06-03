import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { DateTime } from "luxon";
import "leaflet/dist/leaflet.css";
import "antd/dist/reset.css";
import { Layout, Card, Spin, Typography } from "antd";
import L from "leaflet";
import "./App.css";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  const [ipInfo, setIpInfo] = useState(null);
  const [countryInfo, setCountryInfo] = useState(null);

  useEffect(() => {
    const fetchIpInfo = async () => {
      try {
        const response = await axios.get(
          `https://geo.ipify.org/api/v2/country,city?apiKey=${import.meta.env.VITE_IPIFY_API_KEY}`
        );
        setIpInfo(response.data);

        const countryResponse = await axios.get(
          `https://restcountries.com/v3.1/alpha/${response.data.location.country}`
        );
        setCountryInfo(countryResponse.data[0]);
      } catch (error) {
        console.error("Error fetching IP information:", error);
      }
    };

    fetchIpInfo();
  }, []);

  if (!ipInfo || !countryInfo) {
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
    iconUrl: "/wired-flat-18-location-pin.gif", // Path to your animated icon
    iconSize: [50, 50], // Size of the icon
    iconAnchor: [25, 50], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -50] // Point from which the popup should open relative to the iconAnchor
  });

  return (
    <Layout className="layout">
      <Header className="header">
        <Title>IP Information</Title>
      </Header>
      <Content className="content">
        <div className="ip-info-container">
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
