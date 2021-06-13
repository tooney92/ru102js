const client = redis.getClient();
const key = keyGenerator.getSiteStatsKey(meterReading.siteId, meterReading.dateTime);

// Load script if needed, uses cached SHA if already loaded.
await compareAndUpdateScript.load();

// START Challenge #3
const transaction = client.multi();

transaction.hset(key, 'lastReportingTime', timeUtils.getCurrentTimestamp());
transaction.hincrby(key, 'meterReadingCount', 1);
transaction.expire(key, weekSeconds);

transaction.evalsha(compareAndUpdateScript.updateIfGreater(key, 'maxWhGenerated', meterReading.whGenerated));
transaction.evalsha(compareAndUpdateScript.updateIfLess(key, 'minWhGenerated', meterReading.whGenerated));
transaction.evalsha(compareAndUpdateScript.updateIfGreater(key, 'maxCapacity', meterReading.whGenerated - meterReading.whUsed));

await transaction.execAsync();


const client = redis.getClient();
const key = keyGenerator.getSiteStatsKey(meterReading.siteId, meterReading.dateTime);

// Load script if needed, uses cached SHA if already loaded.
let sha = await compareAndUpdateScript.load();
let transaction = client.multi()

transaction.hset(
  key,
  'lastReportingTime',
  timeUtils.getCurrentTimestamp(),
)

transaction.hincrbyAsync(key, 'meterReadingCount', 1);
transaction.expireAsync(key, weekSeconds);
maxWh = await client.hgetAsync(key, 'maxWhGenerated');
console.log(key);
transaction.evalsha(compareAndUpdateScript.updateIfGreater(key, 'maxWhGenerated', maxWh.maxWhGenerated))
transaction.evalsha(compareAndUpdateScript.updateIfLess(key, 'maxWhGenerated', maxWh.maxWhGenerated))

//client.evalshaAsync(sha, 1, key, value);
const maxCapacity = await client.hgetAsync(key, 'maxCapacity');
const readingCapacity = meterReading.whGenerated - meterReading.whUsed;
if (maxCapacity === null || readingCapacity > parseFloat(maxCapacity)) {
  await client.hsetAsync(key, 'maxCapacity', readingCapacity);
}

await transaction.execAsync();