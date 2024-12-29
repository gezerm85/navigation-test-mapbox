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
import tuzlukcuGeoJson from "../assets/data/tuzlukcu";
import guzargahGeoJson from "../assets/data/yol_formatted2_converted";
import { MAPBOX_ACCESS_TOKEN } from "@env";
import Modal from "../components/Modal/Modal";
import * as turf from "@turf/turf";
import Icon from "react-native-vector-icons/FontAwesome6";

const { width, height } = Dimensions.get("window");

MapboxGL.setAccessToken(MAPBOX_ACCESS_TOKEN);

const MapScreen = () => {
  const [fakeUserLocation, setFakeUserLocation] = useState(null);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const cameraRef = useRef(null);
  const [routeMode, setRouteMode] = useState("walking");

  useEffect(() => {
    if (selectedPolygon && fakeUserLocation) {
      calculateRoute();
    }
  }, [routeMode]); // routeMode değiştiğinde tetiklenir

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
    if (event.features && event.features.length > 0) {
      const coordinates = event.features[0].geometry.coordinates;
      console.log("Tıklanan Poligon Koordinatları:", coordinates);
      setSelectedPolygon(coordinates);
      setModalVisible(true);
    } else {
      console.warn("Poligon tıklanamadı. Event verisi boş.");
    }
  };

  const calculateRoute = async () => {
    if (!selectedPolygon || (!fakeUserLocation )) {
      console.warn("Rota hesaplanamadı: Başlangıç veya hedef noktası eksik.");
      return;
    }
    setModalVisible(false);
    setLoading(true);
  
    try {
      const start = fakeUserLocation; // Kullanıcı başlangıç noktası
      const end = turf.centroid(turf.polygon(selectedPolygon)).geometry.coordinates; // Poligon merkezi
  
      console.log("Start (Kullanıcı Konumu):", start);
      console.log("End (Poligon Merkezi):", end);
  
      // Tüm yolları birleştirilmiş bir geometriye çevir
      const allPaths = turf.featureCollection(
        guzargahGeoJson.features.map((feature) =>
          turf.lineString(feature.geometry.coordinates)
        )
      );
  
      if (!allPaths || allPaths.features.length === 0) {
        console.error("Yol verisi boş veya hatalı.");
        return;
      }
  
      // Kullanıcıdan en yakın yola mesafeyi hesapla
      const nearestStart = turf.nearestPointOnLine(allPaths, turf.point(start));
      const nearestEnd = turf.nearestPointOnLine(allPaths, turf.point(end));
  
      if (!nearestStart || !nearestEnd) {
        console.error("nearestStart veya nearestEnd bulunamadı.");
        return;
      }
  
      const nearestStartCoordinates = nearestStart.geometry.coordinates;
      const nearestEndCoordinates = nearestEnd.geometry.coordinates;
  
      console.log("Nearest Start:", nearestStartCoordinates);
      console.log("Nearest End:", nearestEndCoordinates);
  
      // Rota koordinatlarını oluştur
      const routeCoordinates = [
        start, // Kullanıcının konumu
        nearestStartCoordinates, // En yakın başlangıç noktası
        nearestEndCoordinates, // En yakın bitiş noktası
        end, // Poligonun merkezi
      ];
  
      // Rota geometrisini oluştur
      const route = turf.lineString(routeCoordinates);
  
      // Rota uzunluğunu ve süresini hesapla
      const distance = turf.length(route, { units: "kilometers" });
      const speed = routeMode === "walking" ? 5 : 60; // Hız: Yürüyüş (5 km/s), Araç (60 km/s)
      const duration = (distance / speed) * 60; // Süreyi dakika cinsine çevir
  
      setRoute(route);
      setDistance(distance.toFixed(2));
      setDuration(duration.toFixed(2));
  
      console.log(
        `Rota: Mesafe ${distance.toFixed(2)} km, Süre: ${duration.toFixed(
          2
        )} dakika`
      );
    } catch (error) {
      console.error("Rota hesaplanırken hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View style={styles.page}>
      <MapboxGL.MapView style={styles.map}>
        <MapboxGL.Camera
          zoomLevel={19}
          centerCoordinate={fakeUserLocation || [0, 0]} // Varsayılan koordinat
          ref={(ref) => {
            cameraRef.current = ref;
          }}
        />

        <MapboxGL.ShapeSource
          id="polygon-source"
          shape={tuzlukcuGeoJson}
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

        <MapboxGL.ShapeSource id="path-source" shape={guzargahGeoJson}>
          <MapboxGL.LineLayer
            id="path-layer"
            style={{
              lineColor: "blue",
              lineWidth: 2,
            }}
          />
        </MapboxGL.ShapeSource>

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
                lineColor: "red",
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
          <Text>{`Mesafe: ${distance} km, Süre: ${duration} dakika (${routeMode})`}</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={goToFakeLocation}
      >
        <Icon size={36} name="location-dot" color={"blue"} />
      </TouchableOpacity>
      <View style={styles.routeButtonContainer}>
        <TouchableOpacity
          style={[styles.routeButton, { backgroundColor: "blue" }]}
          onPress={() => setRouteMode("walking")}
        >
          <Text style={styles.routeButtonText}>Yürüyüş</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.routeButton1, { backgroundColor: "green" }]}
          onPress={() => setRouteMode("driving")}
        >
          <Text style={styles.routeButtonText}>Araç</Text>
        </TouchableOpacity>
      </View>
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
  routeButtonContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10, // Butonlar arasında boşluk için
  },
  routeButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "blue", // Örnek stil
  },
  routeButton1: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "green", // Örnek stil
  },

  routeButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
