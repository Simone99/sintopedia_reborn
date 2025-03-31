import sql from "../../../db.js";
// import handleOnNewConnection from "../../../db.js";
import { fetchStream } from "../../utility";
import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { rateLimitMiddleware } from "../../../rateLimiter"


export const POST = rateLimitMiddleware(auth(async function POST(req) {
    // {
    //     "reaction_id": 0
    //     "user_id_reported": 0
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
    let user_report = JSON.parse(await fetchStream(req.body));
    try {
        user_report.user_id_reporting = req.auth.user.id;
        await sql`
                INSERT INTO user_reports ${sql(user_report)}
            `;
        // await client.query(`
        //     INSERT INTO user_reports(user_id_reporting, reaction_id, user_id_reported)
        //     VALUES($1, $2, $3)
        // `, [req.auth.user.id, user_report.reaction_id, user_report.user_id_reported]);
        return NextResponse.json(
            {},
            {
                status: 200,
            },
        );
    } catch (e) {
        let error_text = e.toString();
        if (error_text.includes("PostgresError: duplicate key value violates unique constraint")) {
            return NextResponse.json({ "error_text": "User already reported the selected reaction." }, {
                status: 400,
            });
        }
        return NextResponse.json({ "error_text": error_text }, {
            status: 503,
        });
    }
    // }
    // );
}));