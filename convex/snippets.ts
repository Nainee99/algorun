import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSnippet = mutation({
  args: {
    title: v.string(),
    language: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the user identity
    const identity = await ctx.auth.getUserIdentity();
    // If the user is not authenticated, throw an error
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find the user by the user ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    //   If the user is not found, throw an error
    if (!user) throw new Error("User not found");

    // Insert the snippet into the database
    const snippetId = await ctx.db.insert("snippets", {
      userId: identity.subject,
      userName: user.name,
      title: args.title,
      language: args.language,
      code: args.code,
    });

    return snippetId;
  },
});

export const deleteSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },

  handler: async (ctx, args) => {
    // Get the user identity
    const identity = await ctx.auth.getUserIdentity();
    // If the user is not authenticated, throw an error
    if (!identity) throw new Error("Not authenticated");

    // Get the snippet from the database
    const snippet = await ctx.db.get(args.snippetId);
    // If the snippet is not found, throw an error
    if (!snippet) throw new Error("Snippet not found");

    // If the user is not the owner of the snippet, throw an error
    if (snippet.userId !== identity.subject) {
      throw new Error("Not authorized to delete this snippet");
    }

    // Delete the snippet from the database
    const comments = await ctx.db
      .query("snippetComments")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    // Delete all the comments for the snippet
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // Delete all the stars for the snippet
    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    // Delete all the stars for the snippet
    for (const star of stars) {
      await ctx.db.delete(star._id);
    }

    // Delete the snippet
    await ctx.db.delete(args.snippetId);
  },
});

export const getSnippets = query({
  handler: async (ctx) => {
    // Get all the snippets from the database
    const snippets = await ctx.db.query("snippets").order("desc").collect();
    //  Return the snippets
    return snippets;
  },
});

export const isSnippetStarred = query({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    // Get the user identity
    const identity = await ctx.auth.getUserIdentity();
    // If the user is not authenticated, return false
    if (!identity) {
      return false;
    }

    // Check if the user has starred the snippet
    const star = await ctx.db
      .query("stars")
      .withIndex("by_user_id_and_snippet_id")
      .filter(
        (q) =>
          q.eq(q.field("userId"), identity.subject) &&
          q.eq(q.field("snippetId"), args.snippetId)
      )
      .first();
    // Return true if the snippet is starred, false otherwise
    return !!star;
  },
});

export const getSnippetStarCount = query({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    // Get the number of stars for the snippet
    const stars = await ctx.db
      .query("stars")
      .withIndex("by_snippet_id")
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      .collect();

    // Return the number of stars
    return stars.length;
  },
});

export const starSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("stars")
      .withIndex("by_user_id_and_snippet_id")
      .filter(
        (q) =>
          q.eq(q.field("userId"), identity.subject) &&
          q.eq(q.field("snippetId"), args.snippetId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("stars", {
        userId: identity.subject,
        snippetId: args.snippetId,
      });
    }
  },
});

export const getSnippetById = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    // Get the snippet by ID
    const snippet = await ctx.db.get(args.snippetId);
    // If the snippet is not found, throw an error
    if (!snippet) throw new Error("Snippet not found");

    // Return the snippet
    return snippet;
  },
});

export const getComments = query({
  args: { snippetId: v.id("snippets") },
  handler: async (ctx, args) => {
    // Get all the comments for the snippet
    const comments = await ctx.db
      // Query the "snippetComments" table
      .query("snippetComments")
      // Use the "by_snippet_id" index
      .withIndex("by_snippet_id")
      // Filter the comments by the snippet ID
      .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
      // Order the comments in descending order
      .order("desc")
      // Collect the comments
      .collect();

    return comments;
  },
});

export const addComment = mutation({
  args: {
    snippetId: v.id("snippets"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_user_id")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    return await ctx.db.insert("snippetComments", {
      snippetId: args.snippetId,
      userId: identity.subject,
      userName: user.name,
      content: args.content,
    });
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("snippetComments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");

    // Check if the user is the comment author
    if (comment.userId !== identity.subject) {
      throw new Error("Not authorized to delete this comment");
    }

    await ctx.db.delete(args.commentId);
  },
});
