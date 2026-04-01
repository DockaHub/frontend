const https = require('https');

https.get('https://dockahub.vercel.app/assets/index-BHypyQvY.js', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('Includes organizations:', data.includes('organizations/${'));
        console.log('Includes organization:', data.includes('organization/${'));
        console.log('Contains organizers:', data.includes('organizers/${'));
        console.log('Length:', data.length);
    });
}).on('error', (err) => {
    console.error('Error fetching:', err);
});
