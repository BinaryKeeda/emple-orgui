// src/api/runTest.ts
import axios from "axios";

const JUDGE0_BASE = "https://judge0-ce.p.rapidapi.com";

const headers = {
  "x-rapidapi-key": "e96b097e4dmshafa6ce31b0791dep1358c6jsn1444e6ac5663",
  "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
};

// 🧠 Mapping from language name to Judge0 language_id
const LANG_ID: Record<string, number> = {
  c: 50,
  cpp: 54,
  java: 62,
  python: 71,
};

// ✅ Browser + Node safe Base64 helpers
const toBase64 = (str: string): string =>
  typeof window === "undefined"
    ? Buffer.from(str, "utf8").toString("base64")
    : btoa(unescape(encodeURIComponent(str)));

const fromBase64 = (b64?: string): string =>
  !b64
    ? ""
    : typeof window === "undefined"
    ? Buffer.from(b64, "base64").toString("utf8")
    : decodeURIComponent(escape(atob(b64)));

interface RunTestParams {
  language: string;
  source_code: string;
  input: string;
  expectedOutput: string;
}

interface RunTestResult {
  stdout: string;
  stderr: string;
  status: string;
  time: string;
  memory: number;
  passed: boolean;
}

// 🧩 Main Function
export const runSingleTest = async ({
  language,
  source_code,
  input,
  expectedOutput,
}: RunTestParams): Promise<RunTestResult> => {
  try {
    // Step 1️⃣: Create submission with Base64 encoding
    const createRes = await axios.post(
      `${JUDGE0_BASE}/submissions?base64_encoded=true`,
      {
        language_id: LANG_ID[language] ?? 54,
        source_code: toBase64(source_code),
        stdin: toBase64(input),
        expected_output: toBase64(expectedOutput),
      },
      { headers }
    );

    const token = createRes.data.token;
    if (!token) throw new Error("No token received from Judge0");

    // Step 2️⃣: Poll for result
    let result: any = null;
    for (let i = 0; i < 15; i++) {
      const res = await axios.get(`${JUDGE0_BASE}/submissions/${token}`, {
        headers,
        params: { base64_encoded: true },
      });
      result = res.data;
      const statusId = result.status?.id;

      // 1–2 = still running / queued
      if (statusId <= 2) {
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        break;
      }
    }

    // Step 3️⃣: Decode Base64 outputs
    const stdout = fromBase64(result.stdout);
    const stderr = fromBase64(result.stderr);

    // Step 4️⃣: Check if test passed
    const passed =
      stdout.trim() === expectedOutput.trim() &&
      result.status?.description === "Accepted";

    return {
      stdout,
      stderr,
      status: result.status?.description ?? "Unknown",
      time: result.time ?? "",
      memory: result.memory ?? 0,
      passed,
    };
  } catch (err: any) {
    console.error("Judge0 run error:", err);
    throw new Error(err.response?.data?.message || err.message || "Failed to run code");
  }
};
