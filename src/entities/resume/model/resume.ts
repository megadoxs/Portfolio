export interface Resume {
    id: string;
    name: string;
    locale: string;
    url: string;
    active: boolean;
    createdAt: Date;
}

export interface ResumeRequestModel {
    name: string;
    locale: string;
    active: boolean;
    file: File;
}