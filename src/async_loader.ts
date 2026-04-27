// zod
import type { z } from "zod";
const zod = await import("zod");

// enquirer
import type { prompt as PromptType } from "enquirer";
const enq = await import("enquirer");

// chalk
import type { ChalkInstance } from "chalk";
const chalkModule = await import("chalk");

// fs-extra
import type fsExtraType from "fs-extra";
const fsModule = await import("fs-extra");

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
