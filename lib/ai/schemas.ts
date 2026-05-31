import { z } from "zod";

const issueSeveritySchema = z
  .string()
  .transform((value) => {
    const normalized = value.toLowerCase();
    return ["high", "medium", "low"].includes(normalized) ? normalized : "medium";
  });

export const complianceIssueSchema = z.object({
  severity: issueSeveritySchema,
  ingredient: z.string().nullable().optional().transform((value) => value ?? null),
  issue: z.string().min(1).catch("Compliance issue"),
  detail: z.string().min(1).catch("Manual review recommended."),
  cfr_citation: z.string().optional().default(""),
  fix: z.string().optional().default("Review with a qualified regulatory professional."),
});

export const complianceResultSchema = z
  .object({
    score: z.coerce.number().min(0).max(100),
    summary: z.string().min(1),
    regulatory_category: z.string().min(1).default("unclear"),
    issues: z.array(complianceIssueSchema).default([]),
    compliant_claims: z.array(z.string()).default([]),
    risky_claims: z.array(z.string()).default([]),
    recommendations: z.array(z.string()).default([]),
    auto_fix_guidance: z.array(z.string()).optional().default([]),
  })
  .transform((result) => ({
    ...result,
    score: Math.round(result.score),
    verified: true,
    manual_review_required: true,
    review_disclaimer:
      "AI compliance review is a drafting aid, not legal or regulatory advice. Verify claims, dose limits, and labeling with qualified counsel before launch.",
  }));

export type ComplianceResult = z.infer<typeof complianceResultSchema>;
