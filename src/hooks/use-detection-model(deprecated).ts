import { DetectionModelContext } from "@/providers/detection-model-provider";
import { use } from "react";

const useDetectionnModel = () => {
  const model = use(DetectionModelContext);
  if (!model) throw new Error("No parent found");
  return model;
};

export default useDetectionnModel;
