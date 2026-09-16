import { ClassificationModelContext } from "@/providers/classification-model-provider";
import { use } from "react";

const useClassificationModel = () => {
  const model = use(ClassificationModelContext);
  if (!model) throw new Error("No parent found");
  return model;
};

export default useClassificationModel;
