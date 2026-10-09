export async function monthWiseDataSupplierReceivables(connection) {
    let finalOutput = [];
    const month = [0, 1, 2];
    let currentMonth, currentYear;
    const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

    for (let monthIndex = 0; monthIndex < month.length; monthIndex++) {
        const monthItem = month[monthIndex];
        let date = new Date();

        currentMonth = date.getMonth() + 1 + monthItem;
        currentYear = date.getFullYear();
        const sql =
            `
            select supplier, round(sum(inbalqty)) as balanceQty
            from MISYFPURREG
            where extract(MONTH from duedate) = '${currentMonth}'
            and extract(YEAR from duedate) = '${currentYear}'
            and inbalqty > 0
            group by supplier
     `
        const result = await connection.execute(sql);
        let resp = result.rows.map(po => ({
            supplier: po[0],
            noOfQty: po[1],
        }))
        date.setMonth(date.getMonth() + monthItem);
        finalOutput.push({
            month: `${monthList[date.getMonth()]}-${date.getFullYear()}`,
            suppliers: resp
        })
    }
    let out = [];
    const suppliers = [...new Set(finalOutput.flatMap(i => i.suppliers).map(i => i.supplier))];
    for (let index = 0; index < suppliers.length; index++) {
        const supplier = suppliers[index];
        let suppliersData;
        const monthArr = month.map(monthItem => {
            let date = new Date();
            date.setMonth(date.getMonth() + monthItem);
            // console.log(date, "date", `${monthList[date.getMonth()]}-${date.getFullYear()}`)
            suppliersData = finalOutput.find(i => i.month === `${monthList[date.getMonth()]}-${date.getFullYear()}`)?.suppliers || [];
            let qty = 0;
            if (suppliersData.length > 0) {
                qty = suppliersData.find(i => i.supplier === supplier)?.noOfQty || 0;
            }
            return qty
        })
        out.push({
            supplier,
            monthWisePoReceivable: monthArr
        })
    }
    return { supplierData: out, monthData: finalOutput.map(i => i.month) };
    // return finalOutput
}

export async function getSupplierWiseMonthlyReceivables(connection) {
    const month = [0, 1, 2]
    const sql =
        `
        select supplier
         from MISYFPURREG a
        group by supplier;
`
    const result = await connection.execute(sql);
    let resp = result.rows.map(po => po[0])

    for (let index = 0; index < resp.length; index++) {
        const supplier = resp[index];

        for (let monthIndex = 0; monthIndex < month.length; monthIndex++) {
            const monthItem = month[monthIndex];
            let date = new Date();

            currentMonth = date.getMonth() + 1 + monthItem;
            currentYear = date.getFullYear();
            const sql =
                `
                select supplier, round(sum(inbalqty)) as balanceQty
                from MISYFPURREG
                where extract(MONTH from duedate) = '${currentMonth}'
                and extract(YEAR from duedate) = '${currentYear}'
                and inbalqty > 0
                group by supplier
         `
            const result = await connection.execute(sql);
            let resp = result.rows.map(po => ({
                supplier: po[0],
                noOfQty: po[1],
            }))
            date.setMonth(date.getMonth() + monthItem);
            finalOutput.push({
                month: `${monthList[date.getMonth()]}`,
                suppliers: resp
            })
        }
        const sql = `
        select round(sum(inbalqty)) as balanceQty
        from MISYFPURREG
        where extract(MONTH from duedate) = 5
        and extract(YEAR from duedate) = 2024
        and inbalqty > 0
        and supplier = ${supplier}
        `
    }
}