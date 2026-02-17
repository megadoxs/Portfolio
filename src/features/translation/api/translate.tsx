"use server";

export interface TranslationResult {
    en: string;
    fr: string;
}

async function translateToLang(text: string, targetLang: string): Promise<{ text: string; detectedLang: string }> {
    const DEEPL_API_KEY = process.env.DEEPL_API_KEY!;
    const DEEPL_URL = "https://api-free.deepl.com/v2/translate";

    const res = await fetch(DEEPL_URL, {
        method: "POST",
        headers: {
            "Authorization": `DeepL-Auth-Key ${DEEPL_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text: [text],
            target_lang: targetLang,
        }),
    });

    if (!res.ok) throw new Error(`DeepL request failed: ${res.statusText}`);

    const data = await res.json();
    return {
        text: data.translations[0].text as string,
        detectedLang: data.translations[0].detected_source_language as string,
    };
}

export async function translateText(text: string): Promise<TranslationResult> {
    if (!text?.trim()) return { en: "", fr: "" };

    const enResult = await translateToLang(text, "EN");
    const detectedLang = enResult.detectedLang;

    const enText = detectedLang === "EN" ? text : enResult.text;

    let frText: string;
    if (detectedLang === "FR") {
        frText = text;
    } else {
        const frResult = await translateToLang(text, "FR");
        frText = frResult.text;
    }

    return { en: enText, fr: frText };
}

export async function translateFields(
    fields: Record<string, string | null>
): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};

    await Promise.all(
        Object.entries(fields).map(async ([key, value]) => {
            if (!value?.trim()) {
                result[`${key}_en`] = value;
                result[`${key}_fr`] = value;
                return;
            }

            const translated = await translateText(value);
            result[`${key}_en`] = translated.en;
            result[`${key}_fr`] = translated.fr;
        })
    );

    return result;
}