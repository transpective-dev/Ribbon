// zod
import type { z as ZodType } from "zod";

const zod = await import("zod");

const al: {
    z: typeof ZodType
} = {
    z: zod.z
}

export default al;