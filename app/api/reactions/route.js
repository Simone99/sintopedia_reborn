import sql from "../../db.js";
// import handleOnNewConnection from "../../db.js";
import { NextResponse } from "next/server";
import { fetchStream, getFilters } from "../utility";
import { auth } from "../../auth";
import { rateLimitMiddleware } from "../../rateLimiter"

const MAX_N_REACTIONS_TO_CREATE = 100;

async function insertReaction(sql, reaction, synthons_associated) {
  // async function insertReaction(client, reaction, synthons_associated) {
  const result = await sql`
    SELECT id
    FROM reactions
    WHERE reaction_smiles@(${reaction["reaction_smiles"]}, '')::bingo.rexact
  `;
  // const result = (await client.query(`
  //   SELECT id
  //   FROM reactions
  //   WHERE reaction_smiles@($1, '')::bingo.rexact
  // `, [reaction["reaction_smiles"]])).rows;
  let reaction_id = undefined;
  if (result.length === 0) {
    const reaction_result = await sql`
      INSERT INTO reactions ${sql(reaction, "reaction_smiles", "reaction_image", "name", "links", "stereoselectivity", "general_reactivity", "methodology_class", "green_chemistry", "year_of_publication")}
      RETURNING id
    `;
    // const reaction_result = (await client.query(`
    //   INSERT INTO reactions (reaction_smiles, reaction_image, name, links, stereoselectivity, general_reactivity, methodology_class, green_chemistry, year_of_publication)
    //   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    //   RETURNING id
    // `, [
    //   reaction["reaction_smiles"],
    //   reaction["reaction_image"],
    //   reaction["name"],
    //   reaction["links"],
    //   reaction["stereoselectivity"],
    //   reaction["general_reactivity"],
    //   reaction["methodology_class"],
    //   reaction["green_chemistry"],
    //   reaction["year_of_publication"]
    // ])).rows;
    reaction_id = reaction_result[0]["id"];
  } else {
    reaction_id = result[0]["id"];
  }
  for (const synthon of synthons_associated) {
    const result = await sql`
        SELECT id
        FROM synthons
        WHERE synthon_smiles@(${synthon["synthon_smiles"]}, '')::bingo.exact
    `;
    // const result = (await client.query(`
    //     SELECT id
    //     FROM synthons
    //     WHERE synthon_smiles@($1, '')::bingo.exact
    // `, [synthon["synthon_smiles"]])).rows;
    // const result = await sql`
    //     SELECT id
    //     FROM synthons
    //     WHERE synthon_smiles = ${synthon["synthon_smiles"]}
    // `;
    let synthon_id = undefined;
    if (result.length === 0) {
      const synthon_result = await sql`
          INSERT INTO synthons ${sql(synthon, "synthon_smiles", "synthon_image")}
          RETURNING id
      `;
      // const synthon_result = (await client.query(`
      //     INSERT INTO synthons(synthon_smiles, synthon_image)
      //     VALUES ($1, $2)
      //     RETURNING id
      // `, [
      //   synthon["synthon_smiles"],
      //   synthon["synthon_image"]
      // ])).rows;
      synthon_id = synthon_result[0]["id"];
    } else {
      synthon_id = result[0]["id"];
    }
    //   const synthon_result = await sql`
    //       INSERT INTO synthons ${sql(synthon, "synthon_smiles", "synthon_image")}
    //       RETURNING id
    //   `;
    //   synthon_id = synthon_result[0]["id"];
    await sql`
        INSERT INTO synthons_reactions ${sql(
      {
        reaction_id: reaction_id,
        synthon_id: synthon_id,
        user_id: reaction.user_id,
      },
      "reaction_id",
      "synthon_id",
      "user_id",
    )}
    `;
    // await client.query(`
    //     INSERT INTO synthons_reactions (reaction_id, synthon_id, user_id)
    //     VALUES ($1, $2, $3)
    // `, [reaction_id, synthon_id, reaction.user_id]);
  }
}

async function getMatchingMolecules(query_ids, user_synthons, filters, nRecords, fromIndex) {
  let query = `
    SELECT search_reactions($1, $2, $3, $4, $5)
  `;
  let query_result = await sql.unsafe(query, [
    // let query_result = await client.query(query, [
    JSON.stringify(query_ids),
    JSON.stringify(user_synthons),
    JSON.stringify(filters),
    nRecords,
    fromIndex
  ]);
  let reactions = JSON.parse(query_result[0]["search_reactions"]);
  // let reactions = JSON.parse(query_result.rows[0]["search_reactions"]);
  return reactions;
}

async function removeReaction(reactionId, userId) {
  await sql`
    DELETE FROM synthons_reactions
    WHERE reaction_id = ${reactionId} AND user_id = ${userId}
    `;
  // await client.query(`
  //   DELETE FROM synthons_reactions
  //   WHERE reaction_id = $1 AND user_id = $2
  // `, [reactionId, userId]);
}

async function updateReaction(reaction) {
  await sql`
    UPDATE reactions
    SET ${sql(reaction, "links", "name", "stereoselectivity", "general_reactivity", "methodology_class", "green_chemistry", "year_of_publication")}
    WHERE id = ${reaction.id}
    `;
  // await client.query(`
  //   UPDATE reactions
  //   SET links = $1, name = $2, stereoselectivity = $3, general_reactivity = $4, methodology_class = $5, green_chemistry = $6, year_of_publication = $7
  //   WHERE id = $8
  // `, [
  //   reaction["links"],
  //   reaction["name"],
  //   reaction["stereoselectivity"],
  //   reaction["general_reactivity"],
  //   reaction["methodology_class"],
  //   reaction["green_chemistry"],
  //   reaction["year_of_publication"],
  //   reaction.id
  // ]);
}

function setFiltersToReaction(reaction) {
  let filters = reaction.filters;
  delete reaction.filters;
  reaction["stereoselectivity"] = filters[
    "Stereoselectivity"
  ]
    ? filters["Stereoselectivity"]
    : [];
  reaction["general_reactivity"] = filters["General Reactivity"]
    ? filters["General Reactivity"]
    : [];
  reaction["methodology_class"] = filters["Methodology class"]
    ? filters["Methodology class"]
    : [];
  reaction["green_chemistry"] = filters["Green chemistry"]
    ? filters["Green chemistry"]
    : null;
  reaction["year_of_publication"] = filters["Year of publication"]
    ? filters["Year of publication"]
    : null;
  return reaction;
}

export const GET = rateLimitMiddleware(async function GET(req) {
  // return handleOnNewConnection(async (client) => {
  try {
    const molecules_to_match = JSON.parse(req.headers.get("molecule"));
    const filters_header = JSON.parse(req.headers.get("filters"));
    const query_ids = JSON.parse(req.headers.get("query_ids"));
    let nRecords = req.headers.get("nRecords");
    let fromIndex = req.headers.get("fromIndex");
    if (fromIndex < 0) fromIndex = 0;
    if (nRecords < 0) nRecords = 10;
    const result = await getMatchingMolecules(query_ids, molecules_to_match, getFilters(filters_header), nRecords, fromIndex);
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
});

export const PUT = rateLimitMiddleware(async function PUT(req) {
  // return handleOnNewConnection(async (client) => {
  try {
    let params = JSON.parse(await fetchStream(req.body));
    const molecules_to_match = JSON.parse(params["molecule"]);
    const filters_header = JSON.parse(params["filters"]);
    const query_ids = JSON.parse(params["query_ids"]);
    let nRecords = params["nRecords"];
    let fromIndex = params["fromIndex"];
    if (fromIndex < 0) fromIndex = 0;
    if (nRecords < 0) nRecords = 10;
    const result = await getMatchingMolecules(query_ids, molecules_to_match, getFilters(filters_header), nRecords, fromIndex);
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
});

export const POST = rateLimitMiddleware(auth(async function POST(req) {
  // {
  //   synthons: [
  //     {
  //       "synthon_smiles": "[H]C([C-](*)*)=O",
  //       "synthon_image": []
  //     },
  //     {
  //       "synthon_smiles": "*[CH+]C[N+]([O-])=O",
  //       "synthon_image": []
  //     }],
  //   reaction_smiles: 'C(=O)O.OCC>>C(=O)OCC.O',
  //   reaction_image: []
  //   links: [],
  //   name: 'Simone Zanella',
  //   filters: {
  //      "General Reactivity": [],
  //      "Stereoselectivity": [],
  //      "Methodology class": [
  //          "transition metal catalysis",
  //      ],
  //      "Green chemistry": 0,
  //      "Year of publication": 0
  //    },
  // }

  if (!req.auth) {
    return NextResponse.json(
      {},
      {
        status: 401,
      },
    );
  }

  // I expect a list of objects with the structure highlighted above
  const reactions_to_insert = JSON.parse(await fetchStream(req.body));

  if (reactions_to_insert.length > MAX_N_REACTIONS_TO_CREATE) {
    return NextResponse.json(
      `User is not allowed to create more than ${MAX_N_REACTIONS_TO_CREATE} associations in one API call!`,
      {
        status: 400,
      },
    );
  }

  // return handleOnNewConnection(async (client) => {

  try {
    await sql.begin(async (sql) => {
      for (let reaction of reactions_to_insert) {
        reaction = setFiltersToReaction(reaction);
        reaction.user_id = req.auth.user.id;
        await insertReaction(sql, reaction, reaction.synthons);
      }
    });
    // await client.query('BEGIN');
    // for (let reaction of reactions_to_insert) {
    //   reaction = setFiltersToReaction(reaction);
    //   reaction.user_id = req.auth.user.id;
    //   await insertReaction(client, reaction, reaction.synthons);
    // }
    // await client.query('COMMIT');
    return NextResponse.json(
      {},
      {
        status: 200,
      },
    );
  } catch (e) {
    // await client.query('ROLLBACK');
    return NextResponse.json(e.toString(), {
      status: 503,
    });
  }
  // }
  // );
}));

export const DELETE = rateLimitMiddleware(auth(async function DELETE(req) {
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
    const reactionId = req.headers.get("reactionId");
    await removeReaction(reactionId, req.auth.user.id);
    return NextResponse.json(
      {},
      {
        status: 200,
      },
    );
  } catch (e) {
    return NextResponse.json(e.toString(), {
      status: 503,
    });
  }
  // }
  // );
}));

export const PATCH = rateLimitMiddleware(auth(async function PATCH(req) {
  // {
  //   id: 0,
  //   links: [],
  //   name: 'Simone Zanella',
  //   filters: {
  //      "General Reactivity": [],
  //      "Stereoselectivity": [],
  //      "Methodology class": [
  //          "transition metal catalysis",
  //      ],
  //      "Green chemistry": 0,
  //      "Year of publication": 0
  //    },
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
  try {
    let reaction_to_update = JSON.parse(await fetchStream(req.body));
    reaction_to_update = setFiltersToReaction(reaction_to_update);
    await updateReaction(reaction_to_update);
    return NextResponse.json(
      {},
      {
        status: 200,
      },
    );
  } catch (e) {
    return NextResponse.json(e.toString(), {
      status: 503,
    });
  }
  // }
  // );
}));
