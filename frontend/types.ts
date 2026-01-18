export enum Colors {
  primary = "#502274",
  secondary = "#64a6bd",
  tertiary = "#CE6A85",
  dark = "#3f3f37",
  light = "#efebce",
  red = "#F54927",
  blue = "#273CF5"
}

export enum loadingStateEnum {
  loading,
  success,
  failed,
  notStarted
}

export const DEFAULT_FONT = "FacultyGlyphic"

export type userType = {
  uid: string;
  name: string,
  gender: "Male" | "Female",
  age: number,
  height: number,
  weight: number,
}

export const BACKEND_URL = "http://localhost:3000"