"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSchema = exports.entityIdSchema = exports.tenantIdSchema = void 0;
const zod_1 = require("zod");
exports.tenantIdSchema = zod_1.z.string().min(1, 'tenantId required');
exports.entityIdSchema = zod_1.z.string().min(1, 'id required');
exports.paginationSchema = zod_1.z.object({
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.number().int().min(1).max(100).default(20)
});
//# sourceMappingURL=validation.js.map