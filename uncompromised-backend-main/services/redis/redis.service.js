const redis = require('../../config/redisConfig');

const redisSet = async (id, data, expiry = process.env.REDIS_TTL, useStringify = true) => {
  let stringifyData;
  if (useStringify) {
    stringifyData = JSON.stringify(data || {});
  } else {
    stringifyData = data;
  }

  const opts = [id, stringifyData];
  if (expiry) {
    const exOptions = ['EX', expiry];
    opts.push(...exOptions);
  }

  await redis.set(...opts);
};

const redisGet = async (id, parseJson = false) => {
  const data = await redis.get(id);
  if (data) {
    return parseJson ? JSON.parse(data) : data;
  } else {
    return null;
  }
};

const redisDelete = async id => {
  await redis.del(id);
};

module.exports = { redisSet, redisGet, redisDelete };
