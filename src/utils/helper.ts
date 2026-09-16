export const allowedDataTypes = [
  "int8",
  "uint8",
  "float32",
  "float16",
] as const;
type AllowedDataTypes = (typeof allowedDataTypes)[number];
export const isAllowedDataType = (
  value: unknown,
): value is AllowedDataTypes => {
  "worklet";
  return allowedDataTypes.some((dataType) => dataType === value);
};

// export const dataTypeToArrayTypeMap = (dataType: AllowedDataTypes) => {
//   "worklet";
//   switch (dataType) {
//     case "float16":
//       return Float16Array;
//     case "float32":
//       return Float32Array;
//     case "int8":
//       return Int8Array;
//     case "uint8":
//       return Uint8ClampedArray;
//   }
// };

export const clamp = (min: number, max: number, value: number) => {
  "worklet";
  return Math.max(min, Math.min(max, value));
};
