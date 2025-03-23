const redis = require("redis");

let redisClient;

async function redisConn() {
  if (!redisClient) {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || "redis", // Use service name from Docker
        port: process.env.REDIS_PORT || 6379,    // Use correct Redis port
      },
    });
    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redisClient.connect()
      .then(() => console.log("Connected to Redis"))
      .catch((err) => console.error("Redis Connection Failed:", err));

    const result = await redisClient.ping();
    console.log(result);
  }

  return redisClient;
}

function getRedisClient() {
  if (!redisClient) {
    throw new Error("Redis client is not initialized. Call redisConn() first.");
  }
  return redisClient;
}

module.exports = { redisConn, getRedisClient };
