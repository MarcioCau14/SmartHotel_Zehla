
const net = require('net');
const { execSync } = require('child_process');



// 1. Check REDIS_URL in environment


// 2. TCP Connection Test
const client = new net.Socket();
const timeout = 5000;

client.setTimeout(timeout);



client.connect(6379, '127.0.0.1', () => {
    
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
