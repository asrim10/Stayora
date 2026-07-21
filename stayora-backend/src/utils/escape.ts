// * Escape special regex characters in user-provided search input  to prevent ReDoS attacks and regex injection via MongoDB $regex.

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
