export interface Work {
    id: string;
    company: string;
    position_en: string;
    position_fr: string;
    startDate: string;
    endDate: string | null;
}

export interface WorkRequestModel {
    company: string;
    position_en: string;
    position_fr: string;
    startDate: string;
    endDate: string | null;
}