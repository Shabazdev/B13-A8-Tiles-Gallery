const net = require('net');

const shardIp = '159.41.192.43';
const start = Date.now();

const socket = net.createConnection({ host: shardIp, port: 27017, timeout: 8000 }, () => {
  console.log(`TCP_TO_SHARD_SUCCESS (ms: ${Date.now() - start})`);
  console.log('Remote address:', socket.remoteAddress, 'port:', socket.remotePort);
  socket.end();
  process.exit(0);
});

socket.on('error', (err) => {
  console.log('TCP_TO_SHARD_FAIL');
  console.log('CODE:', err.code);
  console.log('MESSAGE:', err.message.split('\n')[0]);
  process.exit(1);
});

socket.setTimeout(8000, () => {
  console.log('TCP_TO_SHARD_TIMEOUT');
  socket.destroy();
  process.exit(1);
});
