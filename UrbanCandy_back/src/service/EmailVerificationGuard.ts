import { ApiException } from '../exception/ApiException.js';
import { getEmailVerificationStatus } from './EmailServiceClient.js';

export async function requireVerifiedEmail(email: string, userId: number): Promise<void> {
  let status: Awaited<ReturnType<typeof getEmailVerificationStatus>>;
  try {
    status = await getEmailVerificationStatus(email);
  } catch {
    throw new ApiException('EMAIL_VERIFICATION_UNAVAILABLE', 503);
  }

  if (!status.verified || status.userId !== userId) {
    throw new ApiException('EMAIL_NOT_VERIFIED', 403);
  }
}
