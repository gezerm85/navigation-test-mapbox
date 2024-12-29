import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import geoJsonData from "../assets/data/tuzlukcu";
import Modal from "../components/Modal/Modal";
import * as turf from "@turf/turf";
import Icon from "react-native-vector-icons/FontAwesome6";

const { width, height } = Dimensions.get("window");

MapboxGL.setAccessToken(
  "pk.eyJ1IjoiZ2V6ZXJtODUiLCJhIjoiY20xcnRobGltMDd0bjJpcjE2aXA4NG81aCJ9.eYe0V85BeffvRX3VNEQmWQ"
);


const MapScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [fakeUserLocation, setFakeUserLocation] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Konum izni reddedildi");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log("Kullanıcı konumu:", latitude, longitude);
   setUserLocation([longitude, latitude]);
    })();
  }, []);


  const goToUserLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      console.log("Kullanıcının mevcut konumu:", latitude, longitude);
      setUserLocation([longitude, latitude]);
      cameraRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: 19,
      });
    } catch (error) {
      console.error("Kullanıcı konumuna gidilirken hata oluştu:", error);
    }
  };

  const goToFakeLocation = () => {
   //  const fakeLocation = [33.15849914726721, 40.22152086973759]; // cubuk
   const fakeLocation = [31.6131288936898, 38.5254813266148];

    setFakeUserLocation(fakeLocation);
    cameraRef.current.setCamera({
      centerCoordinate: fakeLocation,
      zoomLevel: 19,
    });
    console.log("Sahte kullanıcı konumu ayarlandı:", fakeLocation);
  };

  const handlePolygonPress = (event) => {
    const coordinates = event.features[0].geometry.coordinates;
    setSelectedPolygon(coordinates);
    setModalVisible(true);
  };

  const calculateRoute = () => {
    if (!selectedPolygon || (!fakeUserLocation && !userLocation)) return;
  
    setLoading(true);
    setModalVisible(false);
  
    setTimeout(() => {
      const start = turf.point(fakeUserLocation || userLocation); // Sahte veya gerçek kullanıcı konumu
      const end = turf.centroid(turf.polygon(selectedPolygon));
  
      // 10 metre tampon bölgeleri hesapla ve engelleri oluştur
      const bufferDistance = 0.00005; // 5 cm
      const obstacles = turf.featureCollection(
        geoJsonData.features.map((feature) =>
          turf.buffer(turf.polygon(feature.geometry.coordinates), bufferDistance, {
            units: "kilometers",
          })
        )
      );
  
      // Kısa yol hesapla, tampon bölgeler engel olarak eklenir
      const options = { obstacles };
      const shortestPath = turf.shortestPath(start, end, options);
  
      if (shortestPath) {
        setRoute(shortestPath);
  
        const length = turf.length(shortestPath, { units: "kilometers" });
        const approxDuration = (length / 50) * 60; // Ortalama hız: 50 km/saat
  
        setDistance(length.toFixed(2));
        setDuration(approxDuration.toFixed(2));
      } else {
        console.warn("Yol bulunamadı, dar alanlar engellenmiş olabilir.");
      }
  
      setLoading(false);
    }, 100);
  };
  

  return (
    <View style={styles.page}>
 <MapboxGL.MapView style={styles.map}>
  <MapboxGL.Camera
    zoomLevel={19}
    centerCoordinate={fakeUserLocation || userLocation}
    ref={cameraRef}
  />

  <MapboxGL.ShapeSource
    id="polygon-source"
    shape={geoJsonData}
    onPress={handlePolygonPress}
  >
    <MapboxGL.FillLayer
      id="polygon-layer"
      style={{
        fillColor: "#FF5733",
        fillOpacity: 0.6,
      }}
    />
  </MapboxGL.ShapeSource>

  {/* Gerçek Kullanıcı Marker */}
  {userLocation && !fakeUserLocation && (
    <MapboxGL.PointAnnotation
      id="real-user-marker"
      coordinate={userLocation}
    >
      <View style={styles.marker}>
        <Text style={styles.markerText}>Gerçek Konum</Text>
        <View style={styles.markerDot} />
      </View>
    </MapboxGL.PointAnnotation>
  )}

  {/* Sahte Kullanıcı Marker */}
  {fakeUserLocation && (
    <MapboxGL.PointAnnotation
      id="fake-user-marker"
      coordinate={fakeUserLocation}
    >
      <View style={styles.marker}>
        <Text style={styles.markerText}>Sahte Konum</Text>
        <View style={styles.markerDot} />
      </View>
    </MapboxGL.PointAnnotation>
  )}

  {route && (
    <MapboxGL.ShapeSource id="route-source" shape={route}>
      <MapboxGL.LineLayer
        id="route-layer"
        style={{
          lineColor: "blue",
          lineWidth: 3,
        }}
      />
    </MapboxGL.ShapeSource>
  )}
</MapboxGL.MapView>

      <Modal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onGo={calculateRoute}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      {distance && duration && (
        <View style={styles.infoBox}>
          <Text>{`Mesafe: ${distance} km, Süre: ${duration} dakika`}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.buttonContainer} onPress={goToFakeLocation}>
        <Icon size={36} name="location-dot" color={"blue"} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonContainerAlt} onPress={goToUserLocation}>
        <Icon size={36} name="location-crosshairs" color={"green"} />
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  page: { flex: 1 },
  map: { width, height },
  marker: {
    width: 20,
    height: 20,
    backgroundColor: "blue",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  markerDot: {
    width: 23,
    height: 23,
    backgroundColor: "red",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 150,
    right: 16,
  },
  buttonContainerAlt: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 80,
    right: 16,
  },

});

export default MapScreen;
