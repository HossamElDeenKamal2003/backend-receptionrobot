// test.js
const { JWT } = require('google-auth-library');

async function test() {
    const client = new JWT({
        keyFile: '/home/hossameldeenkamal/Desktop/backend.receptionRobot/jordensouq-7dbf8fb0ac14.json', // غير المسار
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    try {
        const token = await client.authorize();
        console.log('✅ Service Account شغال!');
        console.log('Access Token:', token.access_token.slice(0, 50) + '...');
    } catch (error) {
        console.error('❌ Service Account مش شغال:', error.message);
    }
}

test();