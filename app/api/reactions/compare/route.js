import sql from "../../../db.js";
// import handleOnNewConnection from "../../../db.js";
import { fetchStream } from "../../utility";
import { NextResponse } from "next/server";
import { rateLimitMiddleware } from "../../../rateLimiter"

export const POST = rateLimitMiddleware(async function POST(req) {
  // {
  //   reaction1: "",
  //   reaction2: ""
  // }
  // return handleOnNewConnection(async (client) => {
  const reactions_to_compare = JSON.parse(await fetchStream(req.body));
  try {
    let result = await sql`
        SELECT ${reactions_to_compare.reaction1}@(${reactions_to_compare.reaction2}, '')::bingo.rexact AS result
      `;
    // let result = await client.query(`
    //   SELECT $1@($2, '')::bingo.rexact AS result
    // `, [reactions_to_compare.reaction1, reactions_to_compare.reaction2]);
    return NextResponse.json(result[0], {
      // return NextResponse.json(result.rows[0], {
      status: 200,
    });
  } catch (e) {
    return NextResponse.json(e.toString(), {
      status: 503,
    });
  }
  // }
  // );
})
