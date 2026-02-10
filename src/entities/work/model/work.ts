export interface Work {
    id: string;
    company: string;
    position: string;
    startDate: Date;
    endDate: Date | null;
}

export interface WorkRequestModel {
    company: string;
    position: string;
    startDate: Date;
    endDate: Date | null;
}