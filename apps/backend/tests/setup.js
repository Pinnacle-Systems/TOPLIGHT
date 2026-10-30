import 'dotenv/config';

process.env.NODE_ENV = 'test';
process.env.DISABLE_CRON = 'true';

// BigInt serialization patch for tests
BigInt.prototype['toJSON'] = function () {
  return parseInt(this.toString(), 10);
};

