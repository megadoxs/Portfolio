import { useState } from "react";
import { translateText, translateFields as translateFieldsAction, TranslationResult } from "@/features/translation/index";

export function useTranslate() {
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const translate = async (text: string): Promise<TranslationResult | null> => {
        setIsTranslating(true);
        setError(null);
        try {
            return await translateText(text);
        } catch (err) {
            setError("Translation failed. Please try again.");
            console.error(err);
            return null;
        } finally {
            setIsTranslating(false);
        }
    };

    const translateFields = async (
        fields: Record<string, string | null>
    ): Promise<Record<string, string | null>> => {
        setIsTranslating(true);
        setError(null);
        try {
            return await translateFieldsAction(fields);
        } catch (err) {
            setError("Translation failed. Please try again.");
            console.error(err);
            return {};
        } finally {
            setIsTranslating(false);
        }
    };

    return { translate, translateFields, isTranslating, error };
}