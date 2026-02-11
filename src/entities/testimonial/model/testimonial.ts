import {TestimonialStatus} from "@prisma/client";

export { TestimonialStatus as TestimonialStatus };

export interface Testimonial {
    id: string;
    name: string;
    testimonial: string;
    status: TestimonialStatus;
}

export interface TestimonialRequestModel {
    name: string;
    testimonial: string;
}