export interface Hobby {
    id: string;
    name_en: string;
    name_fr: string;
    picture: string;
}

export interface HobbyRequestModel {
    name_en: string;
    name_fr: string;
    file: File;
}