import React from 'react';
import { StyleSheet, View, Modal as RNModal, Text, Button, TouchableWithoutFeedback } from 'react-native';

const Modal = ({ visible, onClose, onGo }) => {
  return (
    <RNModal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose} // Android geri tuşu için kapatma
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* Sabit içerik */}
              <Text style={styles.modalTitle}>Poligona Tıkladınız!</Text>
              <Button title="Git" onPress={onGo} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Android için gölge
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Modal;
