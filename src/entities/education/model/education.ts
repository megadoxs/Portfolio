export interface Education {
    id: string;
    institution: string;
    degree_en: string | null;
    degree_fr: string | null;
    fieldOfStudy_en: string | null;
    fieldOfStudy_fr: string | null;
    iconType: string;
    startDate: string;
    endDate: string;
}

export interface EducationRequestModel {
    institution: string;
    degree_en: string | null;
    degree_fr: string | null;
    fieldOfStudy_en: string | null;
    fieldOfStudy_fr: string | null;
    iconType: string;
    startDate: string;
    endDate: string;
}