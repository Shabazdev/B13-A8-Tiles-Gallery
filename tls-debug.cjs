const tls = require('tls');

const shardIp = '159.41.192.43';
const shardSni = 'ac-wxcosqs-shard-00-00.kdl1dya.mongodb.net';

console.log('=== TLS Handshake Debug ===');
console.log('Target:', shardIp, ':', 27017);
console.log('SNI:', shardSni);

function tryConnect(label, options) {
  const opts = {
    host: shardIp,
    port: 27017,
    servername: shardSni,
    rejectUnauthorized: true,
    timeout: 8000,
    ...options,
  };

  console.log(`\n--- ${label} ---`);
  const s = tls.connect(opts, () => {
    console.log(`${label}_SUCCESS`);
    console.log('Cipher:', JSON.stringify(s.getCipher()));
    console.log('Protocol:', s.getProtocol());
    const cert = s.getPeerCertificate(true);
    console.log('Cert issuer CN:', cert.issuer?.CN);
    console.log('Cert subject CN:', cert.subject?.CN);
    s.end();
    process.exit(0);
  });

  s.on('error', (err) => {
    console.log(`${label}_FAIL`);
    console.log('Code:', err.code);
    console.log('SystemError:', err.systemError);
    console.log('Message:', err.message.split('\n')[0]);
    s.destroy();
    setTimeout(nextTest, 300);
  });

  s.setTimeout(8000, () => {
    console.log(`${label}_TIMEOUT`);
    s.destroy();
    setTimeout(nextTest, 300);
  });
}

const tests = [
  { label: 'DEFAULT_WITH_SNI', options: { servername: shardSni } },
  { label: 'NO_SNI', options: { servername: undefined } },
  { label: 'TLS12_METHOD', options: { secureProtocol: 'TLSv1_2_method', servername: shardSni } },
  { label: 'TLS13_METHOD', options: { secureProtocol: 'TLSv1_3_method', servername: shardSni } },
];

let idx = 0;
function nextTest() {
  if (idx >= tests.length) {
    console.log('\n=== All tests completed ===');
    console.log('Result: NONE succeeded. TLS handshake rejected by server in all configurations.');
    process.exit(1);
    return;
  }
  tryConnect(tests[idx].label, tests[idx].options);
  idx++;
}

nextTest();
