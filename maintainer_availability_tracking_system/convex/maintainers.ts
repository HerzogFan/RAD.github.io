import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const maintainers = await ctx.db.query("maintainers").collect();
    const now = Date.now();
    
    // Return maintainers with computed availability status
    return maintainers.map(maintainer => {
      if (!maintainer.isAvailable && maintainer.unavailableUntil && maintainer.unavailableUntil <= now) {
        return {
          ...maintainer,
          isAvailable: true,
          unavailableUntil: undefined,
          unavailableReason: undefined,
        };
      }
      return maintainer;
    });
  },
});

export const getUnavailable = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const unavailableMaintainers = await ctx.db
      .query("maintainers")
      .withIndex("by_availability", (q) => q.eq("isAvailable", false))
      .collect();
    
    const now = Date.now();
    return unavailableMaintainers.filter(m => 
      !m.unavailableUntil || m.unavailableUntil > now
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("maintainers", {
      name: args.name,
      email: args.email,
      department: args.department,
      isAvailable: true,
      lastUpdated: Date.now(),
    });
  },
});

export const markUnavailable = mutation({
  args: {
    maintainerId: v.id("maintainers"),
    unavailableUntil: v.number(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.maintainerId, {
      isAvailable: false,
      unavailableUntil: args.unavailableUntil,
      unavailableReason: args.reason,
      lastUpdated: Date.now(),
    });
  },
});

export const markAvailable = mutation({
  args: {
    maintainerId: v.id("maintainers"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    await ctx.db.patch(args.maintainerId, {
      isAvailable: true,
      unavailableUntil: undefined,
      unavailableReason: undefined,
      lastUpdated: Date.now(),
    });
  },
});
