import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");


export default styles = StyleSheet.create({
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
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10, // Butonlar arasında boşluk için
  },
  routeButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'blue', // Örnek stil
  },
  routeButton1: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'green', // Örnek stil
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