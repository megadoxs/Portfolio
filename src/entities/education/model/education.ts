export interface Education {
    id: string;
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    iconType: string;
    startDate: Date;
    endDate: Date;
}

export interface EducationRequestModel {
    institution: string;
    degree: string | null;
    fieldOfStudy: string | null;
    iconType: string;
    startDate: Date;
    endDate: Date;
}