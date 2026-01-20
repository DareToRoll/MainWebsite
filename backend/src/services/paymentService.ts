import crypto from "crypto";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
export type JsonObject = { [k: string]: Json };

export type SealAlgorithm = "HMAC-SHA-256" | "SHA-256";

export interface SherlockConfig {
    paymentInitUrl: string;
    secretKey: string;
    merchantId: string;
    keyVersion: string;
    interfaceVersion: string;
    sealAlgorithm?: SealAlgorithm;
    timeoutMs?: number;
    transactionKeyMode?: "auto" | "merchant";
}

export interface PaypageInitResponse {
    redirectionData?: string;
    redirectionStatusCode: string;
    redirectionStatusMessage?: string;
    redirectionUrl?: string;
    redirectionVersion?: string;
    responseEncoding?: string;
    seal?: string;
}

export type CallbackEncode = "base64" | "base64url" | "" | undefined;

export interface SherlockCallbackFields {
    Data: string;
    Seal: string;
    Encode?: CallbackEncode;
    InterfaceVersion?: string;
}

export type CallbackParsed =
    | { kind: "json"; value: Record<string, unknown> }
    | { kind: "kv"; value: Record<string, string> }
    | { kind: "raw"; value: string };

export interface CallbackVerificationResult {
    ok: boolean;
    expectedSeal: string;
    providedSeal: string;
    dataRaw: string;
    encode?: CallbackEncode;
    dataDecoded: string;
    parsed: CallbackParsed;
}

export type PaymentOutcome =
    | { status: "success"; responseCode: string; transactionReference?: string; customerId?: string; raw: CallbackParsed }
    | { status: "cancelled"; responseCode: string; transactionReference?: string; customerId?: string; raw: CallbackParsed }
    | { status: "error"; responseCode?: string; transactionReference?: string; customerId?: string; raw: CallbackParsed };

export interface OneShotInitInput {
    amount: number | string;
    currencyCode?: string;
    orderChannel?: string;
    captureDay?: string;
    captureMode?: string;
    normalReturnUrl: string;
    automaticResponseUrl?: string;
    orderId?: string;
    returnContext?: string;
    transactionOrigin?: string;
    transactionReference?: string;
    customerEmail?: string;
    customerId?: string;
    customerContactEmail?: string;
    extra?: Record<string, string | number | boolean | null | JsonObject | Json[]>;
    flatExtra?: Record<string, string | number | boolean | null>;
}

export function createSherlockPaypage(cfg: SherlockConfig) {
    const algorithm: SealAlgorithm = cfg.sealAlgorithm ?? "HMAC-SHA-256";
    const timeoutMs = cfg.timeoutMs ?? 15000;
    const transactionKeyMode = cfg.transactionKeyMode ?? "auto";

    function buildOneShotInitPayload(input: OneShotInitInput): JsonObject {
        const amountStr = normalizeAmountToCentsString(input.amount);

        const base: Record<string, Json> = {
            amount: amountStr,
            currencyCode: input.currencyCode ?? "978",
            orderChannel: input.orderChannel ?? "INTERNET",
            captureDay: input.captureDay ?? "0",
            captureMode: input.captureMode ?? "AUTHOR_CAPTURE",
            merchantId: cfg.merchantId,
            keyVersion: cfg.keyVersion,
            interfaceVersion: cfg.interfaceVersion,
            normalReturnUrl: input.normalReturnUrl,
            transactionOrigin: input.transactionOrigin ?? "SO_WEBAPPLI",
        };

        // Only include transactionReference if mode is "merchant"
        if (transactionKeyMode === "merchant") {
            base.transactionReference = input.transactionReference ?? makeTransactionReference();
        }

        if (input.automaticResponseUrl) base.automaticResponseUrl = input.automaticResponseUrl;
        if (input.orderId) base.orderId = input.orderId;
        if (input.returnContext) base.returnContext = input.returnContext;
        if (input.customerId) base.customerId = input.customerId;
        if (input.customerEmail) base.customerEmail = input.customerEmail;

        const ccEmail = input.customerContactEmail ?? input.customerEmail;
        if (ccEmail) base.customerContact = { email: ccEmail };

        const nestedFromFlat = input.flatExtra ? convertFlatToNested(input.flatExtra) : {};
        const extra = input.extra ?? {};

        const payload: JsonObject = deepMerge(
            deepMerge(base as JsonObject, nestedFromFlat),
            extra as JsonObject,
        );

        const payloadWithAlgo =
            algorithm === "HMAC-SHA-256" ? ({ ...payload, sealAlgorithm: "HMAC-SHA-256" } as JsonObject) : payload;

        const seal = computeRequestSeal(payloadWithAlgo, cfg.secretKey, algorithm);
        return { ...payloadWithAlgo, seal };
    }

    async function initPayment(payloadOrInput: JsonObject | OneShotInitInput): Promise<PaypageInitResponse> {
        const payload = isPlainObject(payloadOrInput) && !("normalReturnUrl" in payloadOrInput)
            ? (payloadOrInput as JsonObject)
            : buildOneShotInitPayload(payloadOrInput as OneShotInitInput);

        // Log payload keys in non-production
        if (process.env.NODE_ENV !== "production") {
            console.log("[PaymentService] Outgoing payload keys:", Object.keys(payload).sort());
            console.log("[PaymentService] Transaction key mode:", transactionKeyMode);
        }

        const text = await postJson(cfg.paymentInitUrl, payload, timeoutMs);
        const response = JSON.parse(text) as PaypageInitResponse;

        // Log any transaction identifier returned by SIPS
        if (process.env.NODE_ENV !== "production" && response.redirectionStatusCode === "00") {
            console.log("[PaymentService] SIPS response fields:", Object.keys(response).sort());
        }

        return response;
    }

    function requireInitSuccess(resp: PaypageInitResponse) {
        if (resp.redirectionStatusCode !== "00") {
            throw new Error(`Sherlock init failed: ${resp.redirectionStatusCode} ${resp.redirectionStatusMessage ?? ""}`);
        }
        if (!resp.redirectionUrl || !resp.redirectionData || !resp.redirectionVersion) {
            throw new Error("Sherlock init succeeded but missing redirection fields");
        }
        return {
            redirectionUrl: resp.redirectionUrl,
            redirectionData: resp.redirectionData,
            redirectionVersion: resp.redirectionVersion,
        };
    }

    function buildAutoSubmitForm(resp: PaypageInitResponse): string {
        const r = requireInitSuccess(resp);
        return `<form method="post" action="${escapeHtmlAttr(r.redirectionUrl)}"><input type="hidden" name="redirectionVersion" value="${escapeHtmlAttr(
            r.redirectionVersion,
        )}"><input type="hidden" name="redirectionData" value="${escapeHtmlAttr(r.redirectionData)}"></form>`;
    }

    function verifyAndParseCallback(fields: SherlockCallbackFields): CallbackVerificationResult {
        const dataRaw = fields.Data ?? "";
        const providedSeal = fields.Seal ?? "";
        const expectedSeal = computeCallbackSeal(dataRaw, cfg.secretKey, algorithm);
        const ok = expectedSeal === providedSeal;

        const encode = fields.Encode;
        const dataDecoded = decodeData(dataRaw, encode);
        const parsed = parseDecodedData(dataDecoded);

        return { ok, expectedSeal, providedSeal, dataRaw, encode, dataDecoded, parsed };
    }

    function getOutcomeFromCallback(parsed: CallbackParsed): PaymentOutcome {
        const obj = extractObject(parsed);
        const responseCode = obj ? safeString(obj["responseCode"]) : undefined;
        const transactionReference = obj ? safeString(obj["transactionReference"]) : undefined;
        const customerId = obj ? safeString(obj["customerId"]) : undefined;

        if (responseCode === "00") {
            return { status: "success", responseCode, transactionReference, customerId, raw: parsed };
        }
        if (responseCode === "17") {
            return { status: "cancelled", responseCode, transactionReference, customerId, raw: parsed };
        }
        return { status: "error", responseCode, transactionReference, customerId, raw: parsed };
    }

    return {
        buildOneShotInitPayload,
        initPayment,
        requireInitSuccess,
        buildAutoSubmitForm,
        verifyAndParseCallback,
        getOutcomeFromCallback,
    };
}

export function computeRequestSeal(payload: JsonObject, secretKey: string, algorithm: SealAlgorithm): string {
    const data = buildSortedDataValues(payload);

    if (algorithm === "HMAC-SHA-256") {
        return crypto.createHmac("sha256", Buffer.from(secretKey, "utf8")).update(data, "utf8").digest("hex");
    }

    return crypto.createHash("sha256").update(data + secretKey, "utf8").digest("hex");
}

export function buildSortedDataValues(payload: JsonObject): string {
    const withOrder = flattenPairs(payload)
        .filter(([path]) => {
            const leaf = lastSegment(path);
            return leaf !== "seal" && leaf !== "keyVersion" && leaf !== "sealAlgorithm";
        })
        .map((pair, i) => ({ pair, i }))
        .sort((a, b) => {
            const ka = a.pair[0];
            const kb = b.pair[0];
            if (ka < kb) return -1;
            if (ka > kb) return 1;
            return a.i - b.i;
        })
        .map(({ pair }) => pair);

    return withOrder.map(([, v]) => v).join("");
}

export function computeCallbackSeal(dataRaw: string, secretKey: string, algorithm: SealAlgorithm): string {
    if (algorithm === "HMAC-SHA-256") {
        return crypto.createHmac("sha256", Buffer.from(secretKey, "utf8")).update(dataRaw, "utf8").digest("hex");
    }
    return crypto.createHash("sha256").update(dataRaw + secretKey, "utf8").digest("hex");
}

export function decodeData(dataRaw: string, encode?: CallbackEncode): string {
    if (!encode) return dataRaw;
    if (encode === "base64") return Buffer.from(dataRaw, "base64").toString("utf8");
    if (encode === "base64url") return Buffer.from(base64UrlToBase64(dataRaw), "base64").toString("utf8");
    return dataRaw;
}

export function parseDecodedData(dataDecoded: string): CallbackParsed {
    const s = dataDecoded.trim();

    if (s.startsWith("{") && s.endsWith("}")) {
        try {
            return { kind: "json", value: JSON.parse(s) as Record<string, unknown> };
        } catch {
            return { kind: "raw", value: dataDecoded };
        }
    }

    if (s.includes("=") && s.includes("|")) {
        const obj: Record<string, string> = {};
        for (const part of s.split("|")) {
            if (!part) continue;
            const idx = part.indexOf("=");
            if (idx < 0) continue;
            obj[part.slice(0, idx)] = part.slice(idx + 1);
        }
        return { kind: "kv", value: obj };
    }

    return { kind: "raw", value: dataDecoded };
}

export function convertFlatToNested(flat: Record<string, string | number | boolean | null>): JsonObject {
    const out: JsonObject = {};
    for (const [k, v] of Object.entries(flat)) {
        const parts = k.split(".");
        let cur: any = out;
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i];
            cur[p] = cur[p] && typeof cur[p] === "object" && !Array.isArray(cur[p]) ? cur[p] : {};
            cur = cur[p];
        }
        cur[parts[parts.length - 1]] = v === null ? "" : String(v);
    }
    return out;
}

function flattenPairs(value: Json, path = ""): Array<[string, string]> {
    if (value === null || value === undefined) return [[path, ""]];
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [[path, String(value)]];

    if (Array.isArray(value)) {
        let out: Array<[string, string]> = [];
        for (const item of value) out = out.concat(flattenPairs(item, path));
        return out;
    }

    if (typeof value === "object") {
        let out: Array<[string, string]> = [];
        for (const [k, v] of Object.entries(value)) {
            const p = path ? `${path}.${k}` : k;
            out = out.concat(flattenPairs(v, p));
        }
        return out;
    }

    return [[path, String(value)]];
}

async function postJson(url: string, payload: JsonObject, timeoutMs: number): Promise<string> {
    const f = (globalThis as any).fetch as undefined | typeof fetch;
    if (!f) throw new Error("fetch is not available (need Node >= 18 or a fetch polyfill)");

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await f(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        const text = await res.text();
        
        // Always log non-2xx responses (truncate to 2KB)
        if (!res.ok) {
            const truncated = text.substring(0, 2048);
            console.error(`[PaymentService] Sherlock init HTTP ${res.status}:`, truncated);
            throw new Error(`Sherlock init HTTP ${res.status}: ${truncated}`);
        }
        
        return text;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Sherlock init timeout after ${timeoutMs}ms`);
        }
        throw error;
    } finally {
        clearTimeout(t);
    }
}

function normalizeAmountToCentsString(amount: number | string): string {
    if (typeof amount === "number") {
        if (!Number.isFinite(amount)) throw new Error("Invalid amount");
        if (Number.isInteger(amount)) return String(amount);
        return String(Math.round(amount * 100));
    }

    const s = amount.trim();
    if (/^\d+$/.test(s)) return s;

    const normalized = s.replace(",", ".");
    const n = Number(normalized);
    if (!Number.isFinite(n)) throw new Error("Invalid amount string");
    return String(Math.round(n * 100));
}

function makeTransactionReference(prefix = "TREF"): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = crypto.randomBytes(6).toString("hex").toUpperCase();
    const ref = `${prefix}${ts}${rnd}`;
    return ref.length <= 35 ? ref : ref.slice(0, 35);
}

function lastSegment(path: string): string {
    const i = path.lastIndexOf(".");
    return i >= 0 ? path.slice(i + 1) : path;
}

function base64UrlToBase64(s: string): string {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad === 2) b64 += "==";
    else if (pad === 3) b64 += "=";
    else if (pad !== 0) b64 += "===";
    return b64;
}

function escapeHtmlAttr(s: string): string {
    return s
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge(a: JsonObject, b: JsonObject): JsonObject {
    const out: JsonObject = { ...a };
    for (const [k, v] of Object.entries(b)) {
        const av = out[k];
        if (isPlainObject(av) && isPlainObject(v)) out[k] = deepMerge(av as JsonObject, v as JsonObject);
        else out[k] = v as Json;
    }
    return out;
}

function extractObject(parsed: CallbackParsed): Record<string, unknown> | null {
    if (parsed.kind === "json") return parsed.value;
    if (parsed.kind === "kv") return parsed.value;
    return null;
}

function safeString(v: unknown): string | undefined {
    if (typeof v === "string") return v;
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return undefined;
}
