export const round = (num, dec = 10) => {
    const mul = Math.pow(10, dec);
    return Math.round(num * mul) / mul;
};

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

// TODO: Should it be a pure function? All functions need to be pure?
export const makeChange = (needed, cid) => {
    // TODO: Check if spread is ok or map is better?
    // const scid = cid.map(x => x)
    const newCid = [...cid];

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
