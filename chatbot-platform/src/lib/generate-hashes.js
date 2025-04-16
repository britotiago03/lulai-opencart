// generate-hashes.js
const bcrypt = require('bcryptjs');

const passwords = ['admin1password', 'admin2password', 'testy1234', 'clientPassword123']; // Replace with your chosen passwords

passwords.forEach(async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(`Password: ${password}, Hash: ${hash}`);
});