import { describe, expect, it } from "vitest";
import { daysBetween, interest, lateFee, monthlyDueDate } from "./late-fee";

describe("GST late fee", () => {
  it("counts days after the due date", () => {
    expect(daysBetween("2026-09-20", "2026-09-20")).toBe(0);
    expect(daysBetween("2026-09-20", "2026-09-21")).toBe(1);
    expect(daysBetween("2026-09-20", "2026-10-25")).toBe(35);
    expect(daysBetween("2026-09-20", "2026-09-01")).toBe(0);
  });
  it("matches the guide's worked example (35 days, turnover ₹80 lakh)", () => {
    const r = lateFee(35, false, "upto1.5");
    expect(r.total).toBe(1750);
    expect(r.cgst).toBe(875);
    expect(r.capped).toBe(false);
  });
  it("applies turnover caps", () => {
    expect(lateFee(100, false, "upto1.5").total).toBe(2000);
    expect(lateFee(100, false, "1.5to5").total).toBe(5000);
    expect(lateFee(300, false, "above5").total).toBe(10000);
    expect(lateFee(100, false, "upto1.5").capDay).toBe(40);
  });
  it("nil returns: ₹20/day, capped at ₹500 for every turnover", () => {
    expect(lateFee(10, true, "above5").total).toBe(200);
    expect(lateFee(100, true, "above5").total).toBe(500);
    expect(lateFee(100, true, "upto1.5").total).toBe(500);
  });
  it("interest at 18% p.a. matches the guide's example", () => {
    expect(interest(100000, 21)).toBe(1036); // 1,00,000 × 18% × 21/365 = 1,035.6
  });
  it("monthly due dates", () => {
    expect(monthlyDueDate("GSTR-3B", "2026-09")).toBe("2026-10-20");
    expect(monthlyDueDate("GSTR-1", "2026-12")).toBe("2027-01-11");
  });
});
