import { getConnection } from "../constants/db.connection.js";


export async function get(req, res) {
    const connection = await getConnection(res)
    try {
        const result = await connection.execute(`
        select partyName, partymastid from partymast
        where partycat = 'SUPPLIER'
     `)
        let resp = result.rows.map(po => ({
            supplier: po[0], partyMastId: po[1]
        }))
        console.log(resp, 'ypo nresp');
        return res.json({ statusCode: 0, data: resp })
    }
    catch (err) {
        console.error('Error retrieving data:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    finally {
        await connection.close()
    }
}





