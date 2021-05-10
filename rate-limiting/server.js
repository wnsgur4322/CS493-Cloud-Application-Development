const express = require('express');
const redis = require('redis');

const app = express();
const port = process.env.PORT || 8000;

const redisClient = redis.createClient(
  process.env.REDIS_PORT || '6379',
  process.env.REDIS_HOST || 'localhost'
);

const rateLimitWindowMS = 60000;  // milli-seconds
const rateLimitMaxRequests = 5;

function getUserTokenBucket(ip) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(ip, (err, tokenBucket) => {
      if (err){
        reject(err);
      } else if (tokenBucket) {
        tokenBucket.tokens = parseFloat(tokenBucket.tokens);
        resolve(tokenBucket);
      } else {
        resolve({
          tokens: rateLimitMaxRequests,
          last: Date.now()
        });
      }
    });
  });
}

async function saveUserTokenBucket(ip, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(ip, tokenBucket, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function rateLimit(req, res, next) {
  try {
    const tokenBucket = await getUserTokenBucket(req.ip);

    const currentTimestamp = Date.now();
    const ellapsedTime = currentTimestamp - tokenBucket.last;
    tokenBucket.tokens += ellapsedTime * (rateLimitMaxRequests / rateLimitWindowMS);
    tokenBucket.tokens = Math.min(tokenBucket.tokens, rateLimitMaxRequests);
    tokenBucket.last = currentTimestamp;

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      await saveUserTokenBucket(req.ip, tokenBucket);

      next();
    } else {
      res.status(503).send({
        error: "Too many request per minite. Please wait a bit..."
      });
    }
  } catch (err) {
    next();

  }
}

app.use(rateLimit);

app.get('/', (req, res) => {
  res.status(200).json({
    timestamp: new Date().toString()
  });
});

app.use('*', (req, res, next) => {
  res.status(404).json({
    err: "Path " + req.originalUrl + " does not exist"
  });
});

app.listen(port, () => {
  console.log("== Server is running on port", port);
});
