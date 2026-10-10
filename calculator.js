/** Rates are per million tokens; input is normalized ordinary input plus cache reads. */
export function calculateCost({
  inputTokens,
  outputTokens,
  cachedInputTokens = 0,
  inputRate,
  outputRate,
  cachedInputRate,
  attemptMultiplier = 1,
  currency = "USD",
} = {}) {
  for (const [name, value] of Object.entries({ inputTokens, outputTokens, cachedInputTokens })) {
    if (!Number.isSafeInteger(value) || value < 0 || value > 1e12) {
      throw new RangeError(`${name} must be a whole number between 0 and 1,000,000,000,000.`);
    }
  }
  if (cachedInputTokens > inputTokens) {
    throw new RangeError("Cached input tokens cannot exceed total input tokens.");
  }
  for (const [name, value] of Object.entries({ inputRate, outputRate })) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new RangeError(`${name} must be a finite, nonnegative rate per million tokens.`);
    }
  }
  if (cachedInputTokens > 0 && (typeof cachedInputRate !== "number" || !Number.isFinite(cachedInputRate) || cachedInputRate < 0)) {
    throw new RangeError("An explicit cached input rate is required when cached tokens are used.");
  }
  if (cachedInputRate !== undefined && (typeof cachedInputRate !== "number" || !Number.isFinite(cachedInputRate) || cachedInputRate < 0)) {
    throw new RangeError("cachedInputRate must be a finite, nonnegative rate per million tokens.");
  }
  if (typeof attemptMultiplier !== "number" || !Number.isFinite(attemptMultiplier) || attemptMultiplier < 1 || attemptMultiplier > 1000) {
    throw new RangeError("attemptMultiplier must be between 1 and 1,000.");
  }
  if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
    throw new TypeError("currency must be an uppercase three-letter label; no currency conversion is performed.");
  }
  const uncachedInputTokens = inputTokens - cachedInputTokens;
  const uncachedInputCost = uncachedInputTokens / 1e6 * inputRate;
  const cachedInputCost = cachedInputTokens / 1e6 * (cachedInputRate ?? 0);
  const outputCost = outputTokens / 1e6 * outputRate;
  const baseCost = uncachedInputCost + cachedInputCost + outputCost;
  const estimatedCost = baseCost * attemptMultiplier;
  if (![uncachedInputCost, cachedInputCost, outputCost, baseCost, estimatedCost].every(Number.isFinite)) {
    throw new RangeError("The estimated cost exceeds the calculator's numeric range.");
  }
  return Object.freeze({
    currency, uncachedInputTokens, cachedInputTokens, outputTokens,
    uncachedInputCost, cachedInputCost, outputCost, baseCost,
    attemptMultiplier, extraAttemptCost: estimatedCost - baseCost, estimatedCost,
  });
}
