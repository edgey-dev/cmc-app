import useTFLiteModel from "@/hooks/use-tflite-model";
import { createContext } from "react";

type Props = { children: React.ReactNode };

type UseTFLiteModelReturnType = ReturnType<typeof useTFLiteModel>;
export const DetectionModelContext =
  createContext<UseTFLiteModelReturnType | null>(null);

const DetectionModelProvider = (props: Props) => {
  const model = useTFLiteModel({
    modelSource: require("@/assets/models/car_detector.tflite"),
    modelMetadata: { quantization: null, normalised: true, classes: ["car"] },
    useGpu: true,
  });
  return (
    <DetectionModelContext value={model}>
      {props.children}
    </DetectionModelContext>
  );
};

export default DetectionModelProvider;
