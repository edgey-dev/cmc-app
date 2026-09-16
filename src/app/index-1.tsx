import ImagePicker from "@/components/image-picker-btn";
import RotateCamBtn from "@/components/rotate-cam-btn";
import { C } from "@/constants/theme";
import useCameraDevice from "@/hooks/use-camera-device";
import useClassificationModel from "@/hooks/use-classification-model";
import useDetectionnModel from "@/hooks/use-detection-model";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera } from "react-native-vision-camera";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const classificationModel = useClassificationModel();
  const detectionModel = useDetectionnModel();
  const [device, setCameraPosition] = useCameraDevice("back");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  if (!device) return;

  return (
    <View style={styles.container}>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive />

      <SafeAreaView
        className="absolute z-10 bottom-12 justify-center"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(12px)",
          transitionProperty: ["opacity", "transform"],
          transitionDuration: 0.5,
          transitionDelay: "0.2s",
        }}
      >
        <ImagePicker
          onImagePicked={(pickedImage) => {
            console.log(pickedImage.uri);
          }}
        />

        <View className="flex items-center justify-center">
          <View
            className="absolute rounded-full"
            style={{
              width: 72,
              height: 72,
              borderColor: C.ink,
              borderWidth: 1,
              borderStyle: "solid",
              animationName: "pulse-ring",
              animationDuration: 2,
              animationDirection: "ease-out",
              animationTimingFunction: "infinite",
            }}
          />
          <Pressable
            onPress={() => {}}
            className="rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              width: 72,
              height: 72,
              borderColor: C.ink,
              borderStyle: "solid",
              borderWidth: 1.5,
            }}
          >
            <View
              className="rounded-full"
              style={{ width: 54, height: 54, backgroundColor: C.ink }}
            />
          </Pressable>
        </View>

        <RotateCamBtn setCameraPosition={setCameraPosition} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
