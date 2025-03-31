import sql from "../../../db.js";
// import handleOnNewConnection from "../../../db.js";
import { NextResponse } from "next/server";
import { rateLimitMiddleware } from "../../../rateLimiter"


async function getReactionProperties() {
  return await sql`
    SELECT property_name, array_agg(value) AS values
    FROM reaction_properties
    GROUP BY property_name
    `;
}

export const GET = rateLimitMiddleware(async function GET(req) {
  // return handleOnNewConnection(async (client) => {
  try {
    const result = await getReactionProperties();
    return NextResponse.json(result, {
      status: 200,
    });
  } catch (e) {
    return NextResponse.json(e.toString(), {
      status: 503,
    });
  }
  // }
  // );

}
)