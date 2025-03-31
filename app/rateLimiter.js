import { NextResponse } from "next/server";


// Sliding window rate limiter
const idToWindows = new Map();
const windowSize = 10000;
const maxRequests = 10;

function rateLimitMiddleware(handler) {
    return (req, res) => {
        const now = Date.now();

        // get queue or initialize it
        let id = req.ip ?? req.headers["x-forwarded-for"] ?? 'unknown';
        let queue = idToWindows.get(id);
        if (!queue) {
            queue = [];
            idToWindows.set(id, queue);
        }

        // clear old windows
        while (queue.length > 0 && now - queue[0] > windowSize) {
            queue.shift();
        }

        if (queue.length >= maxRequests)
            return NextResponse.json("Too Many Requests", {
                status: 429,
            });

        // add current window to queue
        queue.push(now);

        return handler(req, res);
    }
}

// Fixed window rate limiter
// const rateLimitMap = new Map();

// function rateLimitMiddleware(handler) {
//     return (req, res) => {
//         const ip = req.headers["x-forwarded-for"] || req.connection?.remoteAddress;
//         const limit = 5; // Limiting requests to 5 per minute per IP
//         const windowMs = 60 * 1000; // 1 minute

//         if (!rateLimitMap.has(ip)) {
//             rateLimitMap.set(ip, {
//                 count: 0,
//                 lastReset: Date.now(),
//             });
//         }

//         const ipData = rateLimitMap.get(ip);

//         if (Date.now() - ipData.lastReset > windowMs) {
//             ipData.count = 0;
//             ipData.lastReset = Date.now();
//         }

//         if (ipData.count >= limit) {
//             return NextResponse.json("Too Many Requests", {
//                 status: 429,
//             });
//         }

//         ipData.count += 1;

//         return handler(req, res);
//     };
// }

export { rateLimitMiddleware };
