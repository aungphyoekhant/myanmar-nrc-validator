import {
  scanAndValidateNRCImage,
  scanAndValidateWithRetry,
  scanWithCache,
} from "./index.js"; // သင့် index.js မှတစ်ဆင့် ခေါ်ယူခြင်း

async function runAllTests() {
  const imagePath = "./public/Image.jpeg"; // စမ်းမည့် ပုံရှိရာ လမ်းကြောင်း

  console.log("==========================================");
  console.log("🚀 STARTING ALL OCR PACKAGE TESTS");
  console.log("==========================================");

  // --- Test 1: Standard Scan (`scanAndValidateNRCImage`) ---
  console.log("\n--- [Test 1] Testing Basic Scan ---");
  try {
    const basicResult = await scanAndValidateNRCImage(imagePath, {
      resizeWidth: 2200,
      rotateDegrees: 0,
      grayscale: true,
      normalize: true,
      contrastMultiplier: 1.2,
      debug: true,
    });
    console.log("✅ Basic Scan Result:", JSON.stringify(basicResult, null, 2));
  } catch (error) {
    console.error("❌ Test 1 Failed:", error);
  }

  // --- Test 2: Retry Mechanism (`scanAndValidateWithRetry`) ---
  console.log("\n--- [Test 2] Testing Retry Wrapper (3 Attempts Max) ---");
  try {
    // 💡 Test 1 လိုပဲ options များကို ထည့်ပေးထားခြင်းဖြင့် Attempt 1 မှာတင် အောင်မြင်စွာ မိစေရန်
    const retryResult = await scanAndValidateWithRetry(imagePath, {
      resizeWidth: 2200,
      rotateDegrees: 0,
      grayscale: true,
      normalize: true,
      contrastMultiplier: 1.2,
      minConfidence: 65,
    });
    console.log("✅ Retry Scan Result:", JSON.stringify(retryResult, null, 2));
    console.log(`📌 Total Attempts Made: ${retryResult.attemptsMade}`);
  } catch (error) {
    console.error("❌ Test 2 Failed:", error);
  }

  // --- Test 3: Caching (`scanWithCache`) ---
  console.log("\n--- [Test 3] Testing Cache System ---");
  try {
    console.log("👉 First call (Should be a 'Cache Miss' and run OCR):");
    const start1 = Date.now();
    const cacheResult1 = await scanWithCache(imagePath, {
      resizeWidth: 2200,
      rotateDegrees: 0,
      grayscale: true,
      normalize: true,
      contrastMultiplier: 1.2,
    });
    console.log(`⏱ Time taken: ${Date.now() - start1}ms`);

    console.log(
      "\n👉 Second call (Should be a 'Cache Hit' and return instantly):",
    );
    const start2 = Date.now();
    const cacheResult2 = await scanWithCache(imagePath, {
      resizeWidth: 2200,
      rotateDegrees: 0,
      grayscale: true,
      normalize: true,
      contrastMultiplier: 1.2,
    });
    console.log(`⏱ Time taken: ${Date.now() - start2}ms`);

    console.log(
      "✅ Cache Results Match:",
      cacheResult1.extractedNRC === cacheResult2.extractedNRC,
    );
  } catch (error) {
    console.error("❌ Test 3 Failed:", error);
  }

  // --- Test 4: Concurrent Requests / Worker Pool Stress Test ---
  console.log(
    "\n--- [Test 4] Testing Worker Pool & Queue (Concurrent Requests) ---",
  );
  try {
    console.log("👉 Sending 5 concurrent requests simultaneously...");
    const promises = Array.from({ length: 5 }, (_, index) => {
      console.log(`📤 Dispatching request #${index + 1}`);
      return scanAndValidateWithRetry(imagePath, {
        resizeWidth: 2200,
        rotateDegrees: 0,
        grayscale: true,
        normalize: true,
        contrastMultiplier: 1.2,
      });
    });

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;

    console.log(`✅ All 5 concurrent requests completed in ${duration}ms`);
    results.forEach((res, idx) => {
      console.log(
        `   - Request ${idx + 1}: Success = ${res.success}, Type = ${res.documentType}`,
      );
    });
  } catch (error) {
    console.error("❌ Test 4 Failed:", error);
  }

  console.log("\n==========================================");
  console.log("🏁 ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("==========================================");
}

runAllTests();