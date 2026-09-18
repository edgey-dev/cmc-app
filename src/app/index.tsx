import RotateCamBtn from "@/components/rotate-cam-btn";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import useCameraDevice from "@/hooks/use-camera-device";
import useDetectionnModel from "@/hooks/use-detection-model";
// import useClassificationModel from "@/hooks/use-classification-model";
import { PaintStyle, Skia } from "@shopify/react-native-skia";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
// import { BoTSort } from "react-native-botsort";
// import { Camera, useFrameOutput } from "react-native-vision-camera";
import { BoundingBox } from "react-native-botsort";
import { SkiaCamera } from "react-native-vision-camera-skia";

const paint = Skia.Paint();
paint.setStyle(PaintStyle.Stroke);
paint.setStrokeWidth(3);
paint.setColor(Skia.Color("red"));

const Index = () => {
  const [device, setCameraPosition] = useCameraDevice("back");
  const detectionModel = useDetectionnModel();
  // const classificationModel = useClassificationModel();

  useEffect(() => {
    if (detectionModel.isReady) SplashScreen.hideAsync();
  }, [detectionModel.isReady]);

  // const frameOutput = useFrameOutput({
  //   targetResolution: { width: 640, height: 320 },
  //   pixelFormat: "yuv",
  //   onFrame(frame) {
  //     "worklet";
  //     // console.log(`Height: ${frame.height} Width: ${frame.width}`);
  //     if (!detectionModel.isReady) return frame.dispose();
  //     const start = performance.now();
  //     const output = detectionModel.runInference(frame);
  //     console.log(performance.now() - start);
  //     // console.log(output?.length);
  //   },
  // });

  useEffect(() => {
    // BoTSort.initialize("", false);
  }, []);

  if (device == null) return <ThemedText>Loading camera</ThemedText>;

  return (
    <ThemedView style={styles.container}>
      <RotateCamBtn setCameraPosition={setCameraPosition} />
      <SkiaCamera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive
        allowBackgroundAudioPlayback
        allowHapticsAndSystemSoundsPlayback
        onFrame={(frame, render) => {
          const boxes: BoundingBox[] = [];
          if (detectionModel.isReady) {
            const scaleX =
              frame.width / (detectionModel.inputShape?.[3] ?? 320);
            const scaleY =
              frame.height / (detectionModel.inputShape?.[2] ?? 320);
            const output = detectionModel.runInference(frame, false);
            if (!output) return;
          }

          render(({ frameTexture, canvas }) => {
            canvas.drawImage(frameTexture, 0, 0);
            if (boxes.length === 0) return;
            for (const box of boxes) {
              const rect = Skia.XYWHRect(box.x, box.y, box.width, box.height);
              canvas.drawRect(rect, paint);
            }
          });
          frame.dispose();
        }}
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
