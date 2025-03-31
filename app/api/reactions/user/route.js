import sql from "../../../db.js";
// import handleOnNewConnection from "../../../db.js";
import { NextResponse } from "next/server";
import { auth } from "../../../auth";
import { getFilters } from "../../utility.js";
import { rateLimitMiddleware } from "../../../rateLimiter"

async function getUserReactions(userId, filters, nRecords, fromIndex) {
  let query = `
      SELECT r.id, r.reaction_smiles, r.reaction_image, r.name, r.links, r.stereoselectivity, r.general_reactivity, r.methodology_class, r.green_chemistry, r.year_of_publication, array_agg(s.synthon_image) AS synthons_images, array_agg(s.synthon_smiles) AS synthons_smiles, COUNT(*) OVER() AS total_records
      FROM synthons_reactions sr JOIN reactions r ON (r.id = sr.reaction_id)
            JOIN synthons s ON (s.id = sr.synthon_id)
      WHERE sr.user_id = $1{where_extension}
      GROUP BY r.id
      ORDER BY r.id
      LIMIT $2
      OFFSET $3
  `;
  let parameters = [userId, nRecords, fromIndex];
  let where_clause = [];
  for (let [key, value] of Object.entries(filters)) {
    parameters.push(value);
    if (key === "green_chemistry" || key === "year_of_publication") {
      where_clause.push(`r.${key} = $${parameters.length}`);
    } else if (key === "reaction_name") {
      where_clause.push(`r.name ~* $${parameters.length}`);
    } else {
      where_clause.push(`r.${key} @> ($${parameters.length})`);
    }
  }
  if (where_clause.length > 0) {
    query = query.replace("{where_extension}", " AND " + where_clause.reduce((a, c) => a + " AND " + c));
  } else {
    query = query.replace("{where_extension}", "");
  }

  return await sql.unsafe(query, parameters);
  // return (await client.query(query, parameters)).rows;
}

export const GET = rateLimitMiddleware(auth(async function GET(req) {
  if (!req.auth) {
    return NextResponse.json(
      {},
      {
        status: 401,
      },
    );
  }
  // return handleOnNewConnection(async (client) => {
  try {
    let nRecords = req.headers.get("nRecords");
    let fromIndex = req.headers.get("fromIndex");
    const filters_header = JSON.parse(req.headers.get("filters"));
    if (fromIndex < 0) fromIndex = 0;
    if (nRecords < 0) nRecords = 10;
    const result = await getUserReactions(req.auth.user.id, getFilters(filters_header), nRecords, fromIndex);
    let total_records = 0;
    if (result.length > 0) {
      total_records = result[0]["total_records"];
    }
    for (let reaction of result) {
      reaction["synthons_images_by_user_by_query_id"] = {
        [`${req.auth.user.id}`]: { "0": reaction["synthons_images"] }
      };
      reaction["synthons_smiles_by_user"] = {
        [`${req.auth.user.id}`]: reaction["synthons_smiles"]
      };
      delete reaction["synthons_images"];
      delete reaction["synthons_smiles"];
      delete reaction["total_records"];
    }
    return NextResponse.json([result, total_records], {
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
