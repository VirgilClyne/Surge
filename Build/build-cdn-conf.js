const { fetchWithRetry } = require('./lib/fetch-retry');
const fs = require('fs');
const path = require('path');

(async () => {
  console.time('Total Time - build-cdn-conf');

  const domains = (await (await fetchWithRetry('https://publicsuffix.org/list/public_suffix_list.dat')).text()).split('\n');

  const S3OSSDomains = domains.filter(line => {
    if (line) {
      return (
        line.startsWith('s3-')
        || line.startsWith('s3.')
      )
      && (
        line.endsWith('.amazonaws.com')
        || line.endsWith('.scw.cloud')
      )
      && !line.includes('cn-')
    }

    return false;
  })

  const filePath = path.resolve(__dirname, '../Source/non_ip/cdn.conf');
  const resultPath = path.resolve(__dirname, '../List/non_ip/cdn.conf');
  const content = (await fs.promises.readFile(filePath, 'utf-8'))
    .replace(
      '# --- [AWS S3 Replace Me] ---',
      S3OSSDomains.map(domain => `DOMAIN-SUFFIX,${domain}`).join('\n')
    );

  await fs.promises.writeFile(resultPath, content, 'utf-8');

  console.timeEnd('Total Time - build-cdn-conf');
})();