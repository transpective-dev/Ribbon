import type { z } from "zod";
import type { prompt as PromptType } from "enquirer";
import type { ChalkInstance } from "chalk";
import type fsExtraType from "fs-extra";

// parallel load — total time = slowest module, not sum of all
const [zod, enq, chalkModule, fsModule] = await Promise.all([
    import("zod"),
    import("enquirer"),
    import("chalk"),
    import("fs-extra"),
]);

const al: {
    z: typeof z,
    prompt: typeof PromptType,
    chalk: ChalkInstance,
    fs: typeof fsExtraType
} = {
    z: zod.z,
    prompt: (enq as any).prompt ?? (enq as any).default?.prompt,
    chalk: (chalkModule as any).default ?? chalkModule,
    fs: (fsModule as any).default ?? fsModule
};

export default al;
