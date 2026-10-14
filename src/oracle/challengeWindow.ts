/**
 * Challenge window utilities for oracle resolution candidates.
 *
 * All timestamps are UTC. The challenge window opens at proposedAt and
 * closes at proposedAt + challengeWindowSeconds.
 */

export interface ChallengeWindow {
  opensAt: Date;
  closesAt: Date;
}

/** Stable error code for an invalid `challengeWindowSeconds` value. */
export const CHALLENGE_WINDOW_INVALID_CODE = "CHALLENGE_WINDOW_INVALID";

/**
 * Thrown when `challengeWindowSeconds` is not a finite, non-negative number.
 * An invalid duration is a configuration bug, so it fails loudly instead of
 * producing an Invalid Date or a window that can never be open.
 */
export class ChallengeWindowError extends Error {
  readonly code = CHALLENGE_WINDOW_INVALID_CODE;

  constructor(challengeWindowSeconds: number) {
    super(
      `challengeWindowSeconds must be a finite, non-negative number (received ${challengeWindowSeconds})`
    );
    this.name = "ChallengeWindowError";
  }
}

/**
 * Compute the challenge window for a resolution candidate.
 *
 * @param proposedAt - UTC timestamp when the candidate was proposed.
 * @param challengeWindowSeconds - Duration of the window in seconds. Zero is
 *   valid and yields a window that is already closed.
 * @throws {ChallengeWindowError} If the duration is negative, NaN or Infinity.
 */
export function getChallengeWindow(
  proposedAt: Date,
  challengeWindowSeconds: number
): ChallengeWindow {
  if (!Number.isFinite(challengeWindowSeconds) || challengeWindowSeconds < 0) {
    throw new ChallengeWindowError(challengeWindowSeconds);
  }
  const opensAt = new Date(proposedAt.getTime());
  const closesAt = new Date(
    proposedAt.getTime() + challengeWindowSeconds * 1000
  );
  return { opensAt, closesAt };
}

/**
 * Returns true if the challenge window is still open at the given UTC time.
 *
 * @param proposedAt - UTC timestamp when the candidate was proposed.
 * @param challengeWindowSeconds - Duration of the window in seconds.
 * @param now - Current UTC time (defaults to Date.now()).
 * @throws {ChallengeWindowError} If the duration is negative, NaN or Infinity.
 */
export function isChallengeWindowOpen(
  proposedAt: Date,
  challengeWindowSeconds: number,
  now: Date = new Date()
): boolean {
  const { opensAt, closesAt } = getChallengeWindow(
    proposedAt,
    challengeWindowSeconds
  );
  return now >= opensAt && now < closesAt;
}
