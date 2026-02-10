export interface Education {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    iconType: string;
    startDate: Date;
    endDate: Date;
}

export interface EducationRequestModel {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    iconType: string;
    startDate: Date;
    endDate: Date;
}