import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { ScanOptions } from "../types/scanner.js";

export async function preprocessImage(
  imagePathOrBuffer: string | Buffer,
  options: ScanOptions = {},
): Promise<{ processedBuffer: Buffer }> {
  let pipeline = sharp(imagePathOrBuffer);
  const metadata = await pipeline.metadata();

  // ပုံအရွယ်အစား အနည်းဆုံး 1200 ရှိစေရန် (Image too small error တားဆီးရန်)
  let targetWidth = options.resizeWidth ?? metadata.width ?? 1200;
  if (targetWidth < 1200) {
    targetWidth = 1200;
  }

  if (options.zoomScale) {
    targetWidth = Math.round(targetWidth * options.zoomScale);
  }

  // 💡 Resize ကို တစ်ကြိမ်တည်းဖြင့် သပ်သပ်ရပ်ရပ် လုပ်ဆောင်ခြင်း
  pipeline = pipeline.resize({
    width: targetWidth,
    withoutEnlargement: false,
    fit: "inside",
  });

  if (options.rotateDegrees) {
    pipeline = pipeline.rotate(options.rotateDegrees);
  }

  // 1. Grayscale & Normalize (အရောင်ဖျက်ပြီး အလင်းအမှောင် ညီမျှစေခြင်း)
  if (options.grayscale ?? true) {
    pipeline = pipeline.grayscale();
  }
  if (options.normalize ?? true) {
    pipeline = pipeline.normalize();
  }

  // 2. Median Filter (Noise များကို ဖယ်ရှားပေးခြင်း)
  if (options.median !== undefined && options.median > 0) {
    pipeline = pipeline.median(options.median);
  }

  // 3. Linear Contrast & Brightness (ပုံမမဲသွားစေရန် အလင်း အနည်းငယ် တိုးပေးခြင်း)
  const contrast = options.contrastMultiplier ?? 1.3;
  const brightness = options.brightnessOffset ?? 20; // အမည်းရောင်မလွှမ်းစေရန် အလင်းဘက်သို့ ပို့မည်
  pipeline = pipeline.linear(contrast, brightness);

  // 4. Sharpen (စာလုံးအစွန်းများ ထင်ရှားစေရန်)
  if (options.sharpenSigma !== undefined && options.sharpenSigma > 0) {
    pipeline = pipeline.sharpen({ sigma: options.sharpenSigma });
  }

  // ❌ Threshold ကို လုံးဝ ဖြုတ်ထုတ်လိုက်ပါပြီ (Binary Black/Out ဖြစ်ခြင်းမှ ကာကွယ်ရန်)

  const processedBuffer = await pipeline.toBuffer();

  if (options.debug) {
    const outPath =
      options.debugOutputPath ||
      path.join(process.cwd(), "debug-processed.jpg");
    await fs.writeFile(outPath, processedBuffer);
    console.log(`🛠 [Debug Mode] Processed image saved to: ${outPath}`);
  }

  return { processedBuffer };
}
