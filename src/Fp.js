/**
 * Rounds a number to the specified decimal places.
 *
 * @param {number} num - The number to be rounded.
 * @param {number} [dec=10] - The number of decimal places to round to. Default is 10.
 * @returns {number} - The rounded number.
 */
export const round = (num, dec = 10) => {
    const mul = Math.pow(10, dec);
    return Math.round(num * mul) / mul;
};

/**
 * Improves the given cash-in-drawer (cid) array by adding additional properties to each currency unit.
 *
 * @param {Array<Array<string|number>>} cid - The cash-in-drawer array containing currency units and their amounts.
 * @returns {Array<Object>} - The improved cash-in-drawer array.
 */
export const improveCid = (cid) => {
    const VALUES = [
        ["PENNY", 0.01],
        ["NICKEL", 0.05],
        ["DIME", 0.1],
        ["QUARTER", 0.25],
        ["ONE", 1],
        ["FIVE", 5],
        ["TEN", 10],
        ["TWENTY", 20],
        ["ONE HUNDRED", 100],
    ];

    const improvedCid = cid.map((x) => {
        return {
            currency_unit: x[0],
            ammount_in_dolars: x[1],
            // TODO: maybe there is a better way to do this.
            unit_value: VALUES.filter((v) => v[0] === x[0])[0][1],
            cash: Math.round(x[1] / VALUES.filter((v) => v[0] === x[0])[0][1]),
        };
    });

    return improvedCid;
};

/**
 * Calculates the change to be given based on the amount needed and the available cash in the cash register.
 *
 * @param {number} needed - The amount of change needed.
 * @param {Array} cid - The cash in the cash register, improved by the improveCid function.
 * @returns {Array} - The change in a raw format.
 */
export const makeChange = (needed, cid) => {
    // TODO: Should it be a pure function? All functions need to be pure?
    // TODO: Check if spread is ok or map is better?
    // const scid = cid.map(x => x)
    const newCid = [...cid];

    /**
     * Calculates the change to be given based on the current change amount, index, change array, cash index, unit value index, and accumulator.
     *
     * @param {number} currentChange - The current change amount.
     * @param {number} index - The index of the current currency unit in the newCid array.
     * @param {Array} change - The array containing the change to be given.
     * @param {number} cashIndex - The index of the current cash amount in the newCid array.
     * @param {number} unitValueIndex - The index of the current unit value in the newCid array.
     * @param {number} acc - The accumulator for counting the number of times a currency unit is used.
     * @returns {Array} - The change in a raw format.
     */
    const calculateChange = (
        currentChange,
        index,
        change,
        cashIndex,
        unitValueIndex,
        acc
    ) => {
        if (currentChange === 0 && index == 0) {
            const newChange = [
                ...change,
                [newCid[index].currency_unit, unitValueIndex * acc],
            ];
            return currentChange > 0 ? [] : newChange;
        }

        if (index === 0 && currentChange > 0 && cashIndex == 0) {
            return [];
        }

        if (unitValueIndex > currentChange || cashIndex === 0) {
            return calculateChange(
                currentChange,
                index - 1,
                [
                    ...change,
                    [newCid[index].currency_unit, unitValueIndex * acc],
                ],
                newCid[index - 1].cash, // TODO: check not pure?
                newCid[index - 1].unit_value,
                0
            );
        }

        return calculateChange(
            round(currentChange - unitValueIndex),
            index,
            [...change],
            cashIndex - 1,
            unitValueIndex,
            acc + 1
        );
    };

    return calculateChange(
        needed,
        newCid.length - 1,
        [],
        newCid[newCid.length - 1].cash,
        newCid[newCid.length - 1].unit_value,
        0
    );
};

/**
 * Checks the cash register to determine the status and change to be given based on the price, cash provided, and the available cash in the register.
 * @param {number} price - The price of the item.
 * @param {number} cash - The amount of cash provided.
 * @param {Array} cid - The cash in drawer (cid) array, which is a 2D array of currency units and their amounts.
 * @returns {Object} - An object containing the status and change to be given.
 */
export const checkCashRegister = (price, cash, cid) => {
    const STATUS_TYPE = {
        INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
        CLOSED: "CLOSED",
        OPEN: "OPEN",
    };

    const improvedCid = improveCid(cid);
    const neededFounds = round(cash - price);
    const totalFounds = improvedCid.reduce((total, x) => {
        return total + x.ammount_in_dolars;
    }, 0);

    if (neededFounds === 0) {
        return {
            status: STATUS_TYPE.CLOSED,
            change: [],
        };
    }

    if (totalFounds === neededFounds) {
        return {
            status: STATUS_TYPE.CLOSED,
            change: cid,
        };
    }

    if (totalFounds < neededFounds) {
        return {
            status: STATUS_TYPE.INSUFFICIENT_FUNDS,
            change: [],
        };
    }

    const rawChange = makeChange(neededFounds, improvedCid);
    const actualChange = rawChange.filter((x) => x[1] !== 0);
    const sortedChange = actualChange.sort((a, b) => b[1] - a[1]);

    if (sortedChange.length == 0) {
        return {
            status: STATUS_TYPE.INSUFFICIENT_FUNDS,
            change: sortedChange,
        };
    }

    return {
        status: STATUS_TYPE.OPEN,
        change: sortedChange,
    };
};
