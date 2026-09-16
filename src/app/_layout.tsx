import "@/global.css";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ClassificationModelProvider from "@/providers/classification-model-provider";
import DetectionModelProvider from "@/providers/detection-model-provider";
import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { useEffect } from "react";
import { Button, StyleSheet, useColorScheme } from "react-native";
import { useCameraPermission } from "react-native-vision-camera";
import { Image } from "expo-image";
import Index from ".";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  if (!hasPermission) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <Image
          source={require("@/assets/images/icon_opaque.png")}
          className="size-24"
        />
        <ThemedText style={styles.text}>
          Camera permission is required
        </ThemedText>
        <Button title="Allow Camera" onPress={requestPermission} />
      </ThemedView>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      {/* <ClassificationModelProvider> */}
      <DetectionModelProvider>
        <Index />
      </DetectionModelProvider>
      {/* </ClassificationModelProvider> */}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { fontSize: 18, marginBottom: 20 },
  container: {
    flex: 1,
  },
});
