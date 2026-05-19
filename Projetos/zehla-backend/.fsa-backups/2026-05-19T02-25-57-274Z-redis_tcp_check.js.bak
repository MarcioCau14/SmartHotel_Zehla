
const net = require('net');
const { execSync } = require('child_process');

console.log('--- REDIS NETWORK DIAGNOSIS ---');

// 1. Check REDIS_URL in environment
console.log('Environment REDIS_URL:', process.env.REDIS_URL || 'NOT SET');

// 2. TCP Connection Test
const client = new net.Socket();
const timeout = 5000;

client.setTimeout(timeout);

console.log('Attempting TCP connection to localhost:6379...');

client.connect(6379, '127.0.0.1', () => {
    console.log('✅ TCP Connection SUCCESS: Redis is listening on 6379');
    client.destroy();
    process.exit(0);
});

client.on('error', (err) => {
    console.error('❌ TCP Connection FAILED:', err.message);
    client.destroy();
    process.exit(1);
});

client.on('timeout', () => {
    console.error('❌ TCP Connection TIMEOUT');
    client.destroy();
    process.exit(1);
});
