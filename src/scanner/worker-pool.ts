import { createWorker, type Worker } from "tesseract.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_WORKERS = 3;
const workerPool: Worker[] = [];
const taskQueue: Array<(worker: Worker) => void> = [];
let initialization: Promise<void> | undefined;
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function initWorkerPool(): Promise<void> {
  if (!initialization && workerPool.length === 0) {
    initialization = (async () => {
      const created: Worker[] = [];
      try {
        for (let i = 0; i < MAX_WORKERS; i++) {
          created.push(
            await createWorker(["eng", "mya"], undefined, {
              langPath: packageRoot,
              gzip: false,
            }),
          );
        }
        workerPool.push(...created);
      } catch (error) {
        await Promise.all(created.map((worker) => worker.terminate()));
        throw error;
      }
    })();
  }

  if (initialization) {
    try {
      await initialization;
    } finally {
      initialization = undefined;
    }
  }
}

export async function acquireWorker(): Promise<Worker> {
  await initWorkerPool();
  const worker = workerPool.pop();
  if (worker) return worker;

  return new Promise((resolve) => taskQueue.push(resolve));
}

export function releaseWorker(worker: Worker): void {
  const next = taskQueue.shift();
  if (next) next(worker);
  else workerPool.push(worker);
}
