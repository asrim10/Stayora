"use server";

import { mfaChallenge } from "@/lib/api/mfa";
import { setAuthToken, setUserData } from "../cookie";

/**
 * handleMfaChallenge is kept as a server action because it needs to set
 * httpOnly auth cookies on the Next.js server after a successful MFA challenge.
 *
 * Other MFA operations (setup, verify, disable, status) are called directly
 * from the client component so that the axios interceptor can read the CSRF
 * token from document.cookie (client-side) and include the csrf_token cookie
 * in the request — both required by the backend's double-submit CSRF pattern.
 */
export const handleMfaChallenge = async (tempToken: string, token: string) => {
  try {
    const response = await mfaChallenge(tempToken, token);
    if (response.success) {
      // Set the real auth cookie and user data after successful MFA challenge
      await setAuthToken(response.token);
      await setUserData(response.data);
      return {
        success: true,
        message: "MFA verification successful",
        data: response.data,
      };
    }
    return {
      success: false,
      message: response.message || "MFA challenge failed",
    };
  } catch (error: Error | any) {
    return {
      success: false,
      message: error.message || "MFA challenge action failed",
    };
  }
};
