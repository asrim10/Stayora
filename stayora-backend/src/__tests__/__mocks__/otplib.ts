// Mock for otplib to avoid ESM dependency issues with @scure/base
// Used in mfa.service.ts for TOTP secret generation and verification

export const generateSecret = jest.fn(() => "mock-secret");

export const generateURI = jest.fn(
  () => "otpauth://totp/Stayora:test@example.com?secret=mock-secret",
);

export const verifySync = jest.fn((_opts: any) => ({ valid: true }));
