import RotateCamBtn from "@/components/rotate-cam-btn";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import useCameraDevice from "@/hooks/use-camera-device";
// import useClassificationModel from "@/hooks/use-classification-model";
import useDetectionnModel from "@/hooks/use-detection-model";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
// import { BoTSort } from "react-native-botsort";
import { Camera, useFrameOutput } from "react-native-vision-camera";

SplashScreen.preventAutoHideAsync();

const Index = () => {
  const [device, setCameraPosition] = useCameraDevice("back");
  const detectionModel = useDetectionnModel();
  // const classificationModel = useClassificationModel();

  useEffect(() => {
    if (detectionModel.isReady) SplashScreen.hideAsync();
  }, [detectionModel.isReady]);

  const frameOutput = useFrameOutput({
    targetResolution: { width: 640, height: 320 },
    pixelFormat: "yuv",
    onFrame(frame) {
      "worklet";
      // console.log(`Height: ${frame.height} Width: ${frame.width}`);
      if (!detectionModel.isReady) return frame.dispose();
      const start = performance.now();
      const output = detectionModel.runInference(frame);
      console.log(performance.now() - start);
      // console.log(output?.length);
    },
  });

  useEffect(() => {
    // BoTSort.initialize("", false);
  }, []);

  if (device == null) return <ThemedText>Loading camera</ThemedText>;

  return (
    <ThemedView style={styles.container}>
      <RotateCamBtn setCameraPosition={setCameraPosition} />
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        outputs={[frameOutput]}
      />
    </ThemedView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
