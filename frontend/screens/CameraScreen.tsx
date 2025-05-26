import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Button } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

const MAX_DURATION = 8; // seconds

const CameraScreen = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  // Timer logic (optional)
  React.useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer((t) => {
          if (t >= MAX_DURATION) {
            stopRecording();
            return t;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionMessage}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="grant permission" color="black" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  async function startRecording() {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync({ maxDuration: MAX_DURATION });
        setVideoUri(video.uri);
      } catch (e) {
        // handle error
      }
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    if (cameraRef.current && isRecording) {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructions}>
            Sweep around the food slowly in a circle
            {isRecording ? `\nRecording: ${timer}s` : ''}
          </Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing} disabled={isRecording}>
            <Text style={styles.buttonText}>Flip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, isRecording && styles.recording]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons name={isRecording ? 'stop' : 'videocam'} size={32} color="black" />
          </TouchableOpacity>
        </View>
      </CameraView>
      {videoUri && (
        <View style={styles.savedMessageContainer}>
          <Text style={styles.savedMessage}>Video saved: {videoUri}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: 'white' },
  camera: { flex: 1 },
  instructionsContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  instructions: {
    color: 'black',
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: 'transparent',
    padding: 8,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  recording: {
    borderRadius: 50,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  permissionMessage: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'black',
    fontSize: 16,
  },
  savedMessageContainer: {
    padding: 10,
    alignItems: 'center',
  },
  savedMessage: {
    color: 'black',
    textAlign: 'center',
  },
});

export default CameraScreen;
