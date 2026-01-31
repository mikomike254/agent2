
const https = require('https');

const url = 'https://aaaaaaasshh33.netlify.app';

https.get(url, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body Preview:', data.substring(0, 500));
    });
}).on('error', (e) => {
    console.error(e);
});
