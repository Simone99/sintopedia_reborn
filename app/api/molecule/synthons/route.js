import sql from "../../../db.js";
// import handleOnNewConnection from "../../../db.js";
import { NextResponse } from "next/server";
import { rateLimitMiddleware } from "../../../rateLimiter"


export const GET = rateLimitMiddleware(async function GET(req) {
    // return handleOnNewConnection(async (client) => {
    try {
        const molecule_to_split = req.headers.get("molecule");
        const split_aromatic_bonds = JSON.parse(req.headers.get("split_aromatic_bonds"));
        let query = `
                SELECT get_synthons($1, $2)
            `;
        let query_result = await sql.unsafe(query, [molecule_to_split, split_aromatic_bonds]);
        // let query_result = await client.query(query, [molecule_to_split, split_aromatic_bonds]);
        return NextResponse.json(JSON.parse(query_result[0]["get_synthons"]), {
            // return NextResponse.json(JSON.parse(query_result.rows[0]["get_synthons"]), {
            status: 200,
        });
    } catch (e) {
        return NextResponse.json(e.toString(), {
            status: 503,
        });
    }
    // }
    // );
});
