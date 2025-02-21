import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveExecution = mutation({
  args: {
    language: v.string(),
    code: v.string(),
    // we could have either one of them, or both at the same time
    output: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // check if the user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    // if not, throw an error
    if (!identity) throw new ConvexError("Not authenticated");

    // get the user from the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    //   if the user is not a Pro user and the language is not JavaScript
    if (!user?.isPro && args.language !== "javascript") {
      throw new ConvexError(
        "Only Pro users can run code in languages other than JavaScript"
      );
    }

    // save the code execution
    await ctx.db.insert("codeExecutions", {
      ...args,
      userId: identity.subject,
    });
  },
});
