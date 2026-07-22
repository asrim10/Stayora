import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, JWT_KEYS, CURRENT_KID } from "../config";
import { UserRepository } from "../repositories/user.repositories";
import { HttpError } from "../errors/http-error";
import jwt from "jsonwebtoken";

const userRepository = new UserRepository();
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

export class GoogleOAuthService {
  /**
   * Verify a Google ID token and return the payload.
   */
  async verifyGoogleToken(idToken: string) {
    try {
      const ticket = await oAuth2Client.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new HttpError(401, "Invalid Google token");
      }
      return payload;
    } catch (error) {
      throw new HttpError(401, "Failed to verify Google token");
    }
  }

  /**
   * Find an existing user by googleId or email, or create a new one.
   * Returns the user and a flag indicating if they were newly created.
   */
  async findOrCreateUser(googlePayload: {
    sub: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
  }) {
    const { sub: googleId, email, name, picture } = googlePayload;

    // Try to find by googleId first
    let user = await userRepository.getUserByGoogleId(googleId);

    if (user) {
      return { user, isNew: false };
    }

    // If we have an email, check if a local account exists with this email
    if (email) {
      user = await userRepository.getUserByEmail(email);
      if (user) {
        // Link the Google account to the existing user
        user = await userRepository.updateUser(user._id.toString(), {
          googleId,
          authProvider: "google",
        });
        return { user, isNew: false };
      }
    }

    // Create a new user from Google profile
    const username = this.generateUsername(email || googleId);
    const newUser = await userRepository.createUser({
      email: email || `${googleId}@google-oauth.local`,
      username,
      fullName: name || "Google User",
      imageUrl: picture || undefined,
      googleId,
      authProvider: "google",
    });

    return { user: newUser, isNew: true };
  }

  /**
   * Generate a JWT for a Google-authenticated user.
   */
  generateToken(user: any) {
    const payload = {
      id: user._id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
    return jwt.sign(payload, JWT_KEYS[CURRENT_KID], { algorithm: "HS256", expiresIn: "30d", header: { alg: "HS256", kid: CURRENT_KID } });
  }

  /**
   * Generate a unique username from email or googleId.
   */
  private generateUsername(input: string): string {
    // Try to extract from email
    const atIndex = input.indexOf("@");
    let base = atIndex > 0 ? input.substring(0, atIndex) : input;

    // Remove non-alphanumeric characters
    base = base.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    // Ensure minimum length
    if (base.length < 2) base = `user${base}`;

    // Append random suffix to ensure uniqueness
    const suffix = Math.random().toString(36).substring(2, 7);
    return `${base}_${suffix}`;
  }
}
