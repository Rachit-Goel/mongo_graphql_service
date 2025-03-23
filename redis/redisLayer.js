const { getRedisClient } = require("./client");

async function setDataInCache(params) {
    try {
        const redisClient = getRedisClient();
        await redisClient.set(params.key, params.value, {EX: params.expiryTime});
        return null;
    } catch (error) {
        console.log('Error while saving data in cache -->> ', JSON.stringify(error));
        return error;
    }
}

async function getCachedData(params) {
    try{
        const redisClient = getRedisClient();
        const data = await redisClient.get(params.key);
        return data;
    }catch (error) {
        console.log('Error while getting data from cache -->> ', error);
        return error;
    }
}

module.exports = { setDataInCache, getCachedData };