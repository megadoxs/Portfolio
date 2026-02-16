'use server'

import {prisma} from "@/shared/lib/prisma/db";
import {TestimonialRequestModel} from "@/entities/testimonial";
import {headers} from "next/headers";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

function getRateLimitKey(ip: string): string {
    return `testimonial:${ip}`;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime?: number } {
    const key = getRateLimitKey(ip);
    const now = Date.now();
    const record = rateLimitMap.get(key);

    // Clean up expired entries periodically
    if (rateLimitMap.size > 10000) {
        for (const [k, v] of rateLimitMap.entries()) {
            if (now > v.resetTime) {
                rateLimitMap.delete(k);
            }
        }
    }

    if (!record || now > record.resetTime) {
        const resetTime = now + WINDOW_MS;
        rateLimitMap.set(key, { count: 1, resetTime });
        return { allowed: true, remaining: RATE_LIMIT - 1, resetTime };
    }

    if (record.count >= RATE_LIMIT) {
        return { allowed: false, remaining: 0, resetTime: record.resetTime };
    }

    record.count++;
    return { allowed: true, remaining: RATE_LIMIT - record.count, resetTime: record.resetTime };
}

async function getClientIP(): Promise<string> {
    const headersList = await headers();

    const forwardedFor = headersList.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    const realIP = headersList.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    return 'unknown';
}

export async function addTestimonial(testimonial: TestimonialRequestModel): Promise<{
    success: boolean;
    error?: string;
    remaining?: number;
    resetTime?: number;
}> {
    try {
        const ip = await getClientIP();

        const { allowed, remaining, resetTime } = checkRateLimit(ip);

        if (!allowed) {
            return {
                success: false,
                error: 'RATE_LIMIT_EXCEEDED',
                remaining: 0,
                resetTime
            };
        }

        await prisma.testimonial.create({
            data: testimonial
        });

        return {
            success: true,
            remaining
        };
    } catch (error) {
        console.error('Error adding testimonial:', error);
        return {
            success: false,
            error: 'SERVER_ERROR'
        };
    }
}