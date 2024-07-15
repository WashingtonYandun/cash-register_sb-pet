import { checkCashRegister } from "../src/Imp.js";
import { describe, expect, test } from "vitest";

// Same tests as platform
describe("checkCashRegister - with imperative approach", () => {
    test("return an object", () => {
        const result = checkCashRegister(19.5, 20, [
            ["PENNY", 1.01],
            ["NICKEL", 2.05],
            ["DIME", 3.1],
            ["QUARTER", 4.25],
            ["ONE", 90],
            ["FIVE", 55],
            ["TEN", 20],
            ["TWENTY", 60],
            ["ONE HUNDRED", 100],
        ]);
        expect(result).toBeTypeOf("object");
    });

    describe("When is possible to make a change", () => {
        test('return status "OPEN" and its change', () => {
            const result = checkCashRegister(19.5, 20, [
                ["PENNY", 1.01],
                ["NICKEL", 2.05],
                ["DIME", 3.1],
                ["QUARTER", 4.25],
                ["ONE", 90],
                ["FIVE", 55],
                ["TEN", 20],
                ["TWENTY", 60],
                ["ONE HUNDRED", 100],
            ]);
            expect(result).toEqual({
                status: "OPEN",
                change: [["QUARTER", 0.5]],
            });
        });

        test('return status: "OPEN" and its change sorted from greatest to lowest', () => {
            const result = checkCashRegister(3.26, 100, [
                ["PENNY", 1.01],
                ["NICKEL", 2.05],
                ["DIME", 3.1],
                ["QUARTER", 4.25],
                ["ONE", 90],
                ["FIVE", 55],
                ["TEN", 20],
                ["TWENTY", 60],
                ["ONE HUNDRED", 100],
            ]);
            expect(result).toEqual({
                status: "OPEN",
                change: [
                    ["TWENTY", 60],
                    ["TEN", 20],
                    ["FIVE", 15],
                    ["ONE", 1],
                    ["QUARTER", 0.5],
                    ["DIME", 0.2],
                    ["PENNY", 0.04],
                ],
            });
        });
    });

    describe("When it does not have enough money to make a change", () => {
        test('return status: "INSUFFICIENT_FUNDS" and an empty change', () => {
            const result = checkCashRegister(19.5, 20, [
                ["PENNY", 0.01],
                ["NICKEL", 0],
                ["DIME", 0],
                ["QUARTER", 0],
                ["ONE", 0],
                ["FIVE", 0],
                ["TEN", 0],
                ["TWENTY", 0],
                ["ONE HUNDRED", 0],
            ]);
            expect(result).toEqual({
                status: "INSUFFICIENT_FUNDS",
                change: [],
            });
        });
    });

    describe("When it has the money but not the necessary currency units (bills, coins) to make a change", () => {
        test('return status: "INSUFFICIENT_FUNDS" and an empty change', () => {
            const result = checkCashRegister(19.5, 20, [
                ["PENNY", 0.01],
                ["NICKEL", 0],
                ["DIME", 0],
                ["QUARTER", 0],
                ["ONE", 1],
                ["FIVE", 0],
                ["TEN", 0],
                ["TWENTY", 0],
                ["ONE HUNDRED", 0],
            ]);
            expect(result).toEqual({
                status: "INSUFFICIENT_FUNDS",
                change: [],
            });
        });
    });

    describe("When the needed money is the total of the cid", () => {
        test('return status: "CLOSED" and the cid', () => {
            const result = checkCashRegister(19.5, 20, [
                ["PENNY", 0.5],
                ["NICKEL", 0],
                ["DIME", 0],
                ["QUARTER", 0],
                ["ONE", 0],
                ["FIVE", 0],
                ["TEN", 0],
                ["TWENTY", 0],
                ["ONE HUNDRED", 0],
            ]);
            expect(result).toEqual({
                status: "CLOSED",
                change: [
                    ["PENNY", 0.5],
                    ["NICKEL", 0],
                    ["DIME", 0],
                    ["QUARTER", 0],
                    ["ONE", 0],
                    ["FIVE", 0],
                    ["TEN", 0],
                    ["TWENTY", 0],
                    ["ONE HUNDRED", 0],
                ],
            });
        });
    });
});
