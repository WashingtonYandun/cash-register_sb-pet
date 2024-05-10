const round = (num, dec = 10) => {
    const mul = Math.pow(10, dec);
    return Math.round(num * mul) / mul;
};

const improveCid = (cid) => {
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
            unit_value: VALUES.filter((v) => v[0] === x[0])[0][1],
            cash: Math.round(x[1] / VALUES.filter((v) => v[0] === x[0])[0][1]),
        };
    });

    return improvedCid;
};

const makeChangeWithFor = (needed, cid) => {
    const scid = [...cid];

    const calcChange = (
        currentChange,
        index,
        change,
        cashIndex,
        unitValueIndex,
        acc
    ) => {
        if (currentChange === 0 && index == 0) {
            let newChange = [
                ...change,
                [scid[index].currency_unit, unitValueIndex * acc],
            ];
            return currentChange > 0 ? [] : newChange;
        }

        if (index === 0 && currentChange > 0 && cashIndex == 0) {
            return [];
        }

        if (unitValueIndex > currentChange || cashIndex === 0) {
            return calcChange(
                currentChange,
                index - 1,
                [...change, [scid[index].currency_unit, unitValueIndex * acc]],
                scid[index - 1].cash,
                scid[index - 1].unit_value,
                0
            );
        }

        return calcChange(
            round(currentChange - unitValueIndex),
            index,
            [...change],
            cashIndex - 1,
            unitValueIndex,
            acc + 1
        );
    };

    return calcChange(
        needed,
        scid.length - 1,
        [],
        scid[scid.length - 1].cash,
        scid[scid.length - 1].unit_value,
        0
    );
};

const checkCashRegister = (price, cash, cid) => {
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

    let rawChange = makeChangeWithFor(neededFounds, improvedCid);

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

let a = checkCashRegister(3.26, 100, [
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

let r = {
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
};

console.log(a);
console.log(r);
