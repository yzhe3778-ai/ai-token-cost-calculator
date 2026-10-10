import test from "node:test";
import assert from "node:assert/strict";
import { calculateCost } from "../calculator.js";

const sample = { inputTokens: 1_000_000, outputTokens: 200_000, inputRate: 2, outputRate: 10 };

test("calculates independent input and output charges in the same currency", () => {
  const result = calculateCost(sample);
  assert.equal(result.uncachedInputCost, 2);
  assert.equal(result.outputCost, 2);
  assert.equal(result.estimatedCost, 4);
});

test("cached tokens are a subset of total input and are not charged twice", () => {
  const result = calculateCost({ ...sample, cachedInputTokens: 400_000, cachedInputRate: 0.5 });
  assert.equal(result.uncachedInputTokens, 600_000);
  assert.equal(result.cachedInputCost, 0.2);
  assert.equal(result.estimatedCost, 3.4);
});

test("explicit free cached tokens and all-free rates are valid", () => {
  assert.equal(calculateCost({ ...sample, cachedInputTokens: 1_000_000, cachedInputRate: 0 }).baseCost, 2);
  assert.equal(calculateCost({ ...sample, inputRate: 0, outputRate: 0 }).baseCost, 0);
});

test("fractional attempt multiplier models identical repeat usage without converting currency", () => {
  const result = calculateCost({ ...sample, attemptMultiplier: 1.5, currency: "CNY" });
  assert.equal(result.currency, "CNY");
  assert.equal(result.baseCost, 4);
  assert.equal(result.extraAttemptCost, 2);
  assert.equal(result.estimatedCost, 6);
});

test("zero usage returns zero; no cached rate is required without cached tokens", () => {
  assert.equal(calculateCost({ ...sample, inputTokens: 0, outputTokens: 0 }).estimatedCost, 0);
});

test("rejects impossible cache counts and missing cached rate", () => {
  assert.throws(() => calculateCost({ ...sample, cachedInputTokens: 1_000_001, cachedInputRate: 0.5 }), /exceed/);
  assert.throws(() => calculateCost({ ...sample, cachedInputTokens: 1 }), /explicit cached input rate/);
});

test("rejects empty, fractional, negative, excessive and nonfinite token counts", () => {
  for (const inputTokens of [undefined, "100", -1, 0.5, Infinity, NaN, 1e12 + 1]) {
    assert.throws(() => calculateCost({ ...sample, inputTokens }), RangeError);
  }
});

test("rejects invalid rates, multiplier, currency and arithmetic overflow", () => {
  for (const inputRate of [undefined, "2", -1, NaN, Infinity]) {
    assert.throws(() => calculateCost({ ...sample, inputRate }), RangeError);
  }
  for (const attemptMultiplier of [0, -1, 1001, Infinity, "2"]) {
    assert.throws(() => calculateCost({ ...sample, attemptMultiplier }), RangeError);
  }
  assert.throws(() => calculateCost({ ...sample, currency: "usd" }), TypeError);
  assert.throws(() => calculateCost({ ...sample, inputTokens: 1e12, inputRate: Number.MAX_VALUE }), /numeric range/);
});
