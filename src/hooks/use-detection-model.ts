import { useCallback } from "react";
import { Platform } from "react-native";
import {
  TensorflowModelDelegate,
  useTensorflowModel,
} from "react-native-fast-tflite";
import { Frame } from "react-native-vision-camera";
import { useResizer } from "react-native-vision-camera-resizer";
const hostIsAndroid = Platform.OS === "android";

const useDetectionModel = (useGpu = true) => {
  const delegate: TensorflowModelDelegate[] = useGpu
    ? [hostIsAndroid ? "android-gpu" : "core-ml"]
    : [];

  const { model, state } = useTensorflowModel(
    require("@/assets/models/car_detector.tflite"),
    delegate,
  );

  const {
    resizer,
    state: resizerState,
    error,
  } = useResizer({
    height: model?.inputs[0].shape[2] ?? 320,
    width: model?.inputs[0].shape[3] ?? 320,
    channelOrder: "rgb",
    dataType: "float32",
    scaleMode: "contain",
    pixelLayout: "planar",
  });

  const isReady = resizerState === "ready" && state === "loaded";

  const runInference = useCallback(
    (frame: Frame, disposeFrame = true) => {
      if (!(isReady && resizer && model)) return;

      const resizedFrame = resizer.resize(frame);
      if (disposeFrame) frame.dispose();
      const output = model.runSync([resizedFrame.getPixelBuffer()]);
      resizedFrame.dispose();
      return new Float32Array(output[0]);
    },
    [isReady, resizer, model],
  );

  return {
    model,
    inputShape: model?.inputs[0].shape,
    outputShape: model?.outputs[0].shape,
    isReady,
    runInference,
    error,
  };
};

export default useDetectionModel;
