export function round(num, dec = 10) {
    const mul = Math.pow(10, dec);
    return Math.round(num * mul) / mul;
}

export function improveCid(cid) {
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

            // TODO: revisar con Cris
            unit_value: VALUES.filter((v) => v[0] === x[0])[0][1],
            cash: Math.round(x[1] / VALUES.filter((v) => v[0] === x[0])[0][1]),
        };
    });

    return improvedCid;
}

export function checkCashRegister(price, cash, cid) {
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

    // TODO: revisar con Cris
    // when change is aviable
    let actualChange = makeChage(neededFounds, improvedCid);

    if (actualChange.length == 0) {
        return {
            status: STATUS_TYPE.INSUFFICIENT_FUNDS,
            change: actualChange,
        };
    }

    return {
        status: STATUS_TYPE.OPEN,
        change: actualChange,
    };
}

export function makeChage(needed, cid) {
    const scid = cid.map((x) => {
        return x;
    });

    const change = scid.map((x) => {
        return [x.currency_unit, null];
    });

    let currentChange = round(needed);
    let index = scid.length - 1;
    let acc = 0;

    // Make this recursive
    while (currentChange >= 0 && index >= 0) {
        if (scid[index].unit_value > currentChange || scid[index].cash === 0) {
            change[index][1] = scid[index].unit_value * acc;
            index = index - 1;
            acc = 0;
            continue;
        }

        currentChange = round(currentChange - scid[index].unit_value);
        acc = acc + 1;
        scid[index].cash = scid[index].cash - 1;
    }

    if (currentChange > 0) {
        return [];
    }

    const filteredChange = change.filter((x) => x[1] !== 0);
    return filteredChange.sort((a, b) => b[1] - a[1]);
}
