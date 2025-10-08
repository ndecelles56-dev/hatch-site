import { z } from 'zod';
export declare const tenantIdSchema: z.ZodString;
export declare const entityIdSchema: z.ZodString;
export declare const paginationSchema: z.ZodObject<{
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    cursor?: string;
    limit?: number;
}, {
    cursor?: string;
    limit?: number;
}>;
