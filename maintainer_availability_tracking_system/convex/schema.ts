import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  maintainers: defineTable({
    name: v.string(),
    email: v.string(),
    department: v.string(),
    isAvailable: v.boolean(),
    unavailableUntil: v.optional(v.number()), // timestamp
    unavailableReason: v.optional(v.string()),
    lastUpdated: v.number(),
  }).index("by_availability", ["isAvailable"])
    .index("by_department", ["department"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
