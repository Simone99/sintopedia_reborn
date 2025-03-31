import sql from "../../../db.js";
// import handleOnNewConnection from "../../../db.js";
import { fetchStream } from "../../utility";
import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { rateLimitMiddleware } from "../../../rateLimiter"


export const POST = rateLimitMiddleware(auth(async function POST(req) {

    // {
    //     synthons: [""],
    //     test_synthons: [""]
    // }

    if (!req.auth) {
        return NextResponse.json(
            {},
            {
                status: 401,
            },
        );
    }

    // return handleOnNewConnection(async (client) => {

    const test_to_perform = JSON.parse(await fetchStream(req.body));
    try {
        let query = `
                SELECT test_synthons($1, $2)
            `;
        let query_result = await sql.unsafe(query, [
            // let query_result = await client.query(query, [
            JSON.stringify(test_to_perform["test_synthons"]),
            JSON.stringify(test_to_perform["synthons"]),
        ]);
        return NextResponse.json(JSON.parse(query_result[0]["test_synthons"]), {
            // return NextResponse.json(JSON.parse(query_result.rows[0]["test_synthons"]), {
            status: 200,
        });
    } catch (e) {
        return NextResponse.json(e.toString(), {
            status: 503,
        });
    }
    // }
    // );
}));
