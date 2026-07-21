import z from "zod";

export const SetupMfaDTO = z.object({
  password: z.string().min(6, "Password is required to setup MFA"),
});
export type SetupMfaDTOType = z.infer<typeof SetupMfaDTO>;

export const VerifyMfaDTO = z.object({
  token: z.string().min(1, "Verification code is required"),
});
export type VerifyMfaDTOType = z.infer<typeof VerifyMfaDTO>;

export const DisableMfaDTO = z.object({
  password: z.string().min(6, "Password is required to disable MFA"),
  token: z.string().min(1, "Verification code is required"),
});
export type DisableMfaDTOType = z.infer<typeof DisableMfaDTO>;

export const MfaChallengeDTO = z.object({
  tempToken: z.string().min(1, "Temporary token is required"),
  token: z.string().min(1, "Verification code is required"),
});
export type MfaChallengeDTOType = z.infer<typeof MfaChallengeDTO>;
