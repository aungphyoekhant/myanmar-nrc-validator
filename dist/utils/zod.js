import { z } from "zod";
import { validateNRC } from "./validator.js";
export const nrcStringSchema = z.string().refine((val) => validateNRC(val), {
    message: "Invalid Myanmar National Registration Certificate (NRC) format",
});
export function extendZodWithNRC() {
    z.ZodString.prototype.nrc = function (message) {
        return this.refine((val) => validateNRC(val), {
            message: message || "Invalid Myanmar NRC format",
        });
    };
}
//# sourceMappingURL=zod.js.map