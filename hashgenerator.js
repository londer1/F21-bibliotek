const bcrypt = require('bcryptjs');

const nyttPassord = 'test';
bcrypt.hash(nyttPassord, 10, (err, hash) => {
    if (err) throw err;
    console.log('Hash:', hash);
});
