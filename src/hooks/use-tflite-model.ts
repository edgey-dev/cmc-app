import { clamp, isAllowedDataType } from "@/utils/helper";
import { ModelMetadata } from "@/utils/types";
import { useCallback } from "react";
import { Platform } from "react-native";
import {
  ModelSource,
  TensorflowModelDelegate,
  useTensorflowModel,
} from "react-native-fast-tflite";
import { Frame } from "react-native-vision-camera";
import { useResizer } from "react-native-vision-camera-resizer";

type Props = {
  modelSource: ModelSource;
  modelMetadata: ModelMetadata;
  useGpu?: boolean;
};

const hostIsAndroid = Platform.OS === "android";

const useTFLiteModel = ({
  modelSource,
  modelMetadata,
  useGpu = true,
}: Props) => {
  const delegate: TensorflowModelDelegate[] = useGpu
    ? [hostIsAndroid ? "android-gpu" : "core-ml"]
    : [];
  const { model, state } = useTensorflowModel(modelSource, delegate);
  const {
    resizer,
    state: resizerState,
    error,
  } = useResizer({
    height: 320, // model?.inputs[0].shape[1] ?? 0,
    width: 320, //model?.inputs[0].shape[2] ?? 0,
    channelOrder: "rgb",
    dataType: "uint8",
    scaleMode: "contain",
    pixelLayout: "planar",
  });

  const isReady = state === "loaded" && resizerState === "ready";

  const runInference = useCallback(
    (frame: Frame, disposeFrame = true) => {
      "worklet";
      if (!resizer || !model) throw new Error("model not initialised");

      const dataTypeToArrayTypeMap = {
        float16: Float32Array,
        float32: Float32Array,
        int8: Int8Array,
        uint8: Uint8ClampedArray,
      } as const;

      const inputTensor = model.inputs[0];
      const outputTensor = model.outputs[0];

      const modelQuantized =
        inputTensor.dataType === "uint8" || inputTensor.dataType === "int8";

      if (!isAllowedDataType(inputTensor.dataType))
        throw new Error("Unsupported input data type");
      if (!isAllowedDataType(outputTensor.dataType))
        throw new Error("Unsupported output data type");

      const resizedFrame = resizer.resize(frame);
      if (disposeFrame) frame.dispose();
      const sharedBufferArray = new Uint8Array(resizedFrame.getPixelBuffer());
      const InputDataArray = dataTypeToArrayTypeMap[inputTensor.dataType];
      let pixelArray;
      if (modelQuantized && modelMetadata.quantization) {
        // Quantized model
        pixelArray = new InputDataArray(sharedBufferArray.length);
        const scale = modelMetadata.normalised
          ? modelMetadata.quantization.input.scale * 255
          : modelMetadata.quantization.input.scale;
        const zeroPoint = modelMetadata.quantization.input.zeroPoint;
        if (inputTensor.dataType === "int8") {
          for (let index = 0; index < sharedBufferArray.length; index++)
            pixelArray[index] = clamp(
              -128,
              127,
              Math.round(sharedBufferArray[index] / scale + zeroPoint),
            );
        } else {
          for (let index = 0; index < sharedBufferArray.length; index++)
            pixelArray[index] = Math.round(
              sharedBufferArray[index] / scale + zeroPoint,
            );
        }
      } else {
        pixelArray = new InputDataArray(sharedBufferArray);
        if (modelMetadata.normalised)
          for (let index = 0; index < pixelArray.length; index++)
            pixelArray[index] /= 255.0;
      }
      resizedFrame.dispose();
      try {
        const start = performance.now();
        const output = model.runSync([pixelArray.buffer]);
        console.log(performance.now() - start);

        const OutputDataArray = dataTypeToArrayTypeMap[outputTensor.dataType];
        const rawOutputArray = new OutputDataArray(output[0]);
        if (modelQuantized && modelMetadata.quantization) {
          const dequantizedOuputArray = new Float32Array(rawOutputArray.length);
          const scale = modelMetadata.quantization.output.scale;
          const zeroPoint = modelMetadata.quantization.output.zeroPoint;
          for (let index = 0; index < rawOutputArray.length; index++)
            dequantizedOuputArray[index] =
              (rawOutputArray[index] - zeroPoint) * scale;
          return dequantizedOuputArray;
        }

        return rawOutputArray;
      } catch (error) {
        console.error(error);
      }
    },
    [model, modelMetadata.normalised, modelMetadata.quantization, resizer],
  );
  return {
    model,
    isReady,
    runInference,
    error,
  };
};

export default useTFLiteModel;
