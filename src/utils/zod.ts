import { z } from "zod";
import { validateNRC } from "./validator.js";

export const nrcStringSchema = z.string().refine((val) => validateNRC(val), {
  message: "Invalid Myanmar National Registration Certificate (NRC) format",
});

export function extendZodWithNRC() {
  (z as any).ZodString.prototype.nrc = function (message?: string) {
    return this.refine((val: string) => validateNRC(val), {
      message: message || "Invalid Myanmar NRC format",
    });
  };
}
