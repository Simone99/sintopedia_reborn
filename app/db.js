import postgres from 'postgres'

const sql = postgres({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD
})

export default sql
// import pg from 'pg'
// const { Client } = pg

// async function getClient() {
//     const client = new Client({
//         user: process.env.DATABASE_USER,
//         password: process.env.DATABASE_PASSWORD,
//         host: process.env.DATABASE_HOST,
//         port: process.env.DATABASE_PORT,
//         database: process.env.DATABASE_NAME,
//     });
//     await client.connect();
//     return client;
// }

// async function releaseClient(client) {
//     await client.end();
// }

// async function handleOnNewConnection(f) {
//     let client = await getClient();
//     let result = await f(client);
//     await releaseClient(client);
//     return result;
// }

// export default handleOnNewConnection