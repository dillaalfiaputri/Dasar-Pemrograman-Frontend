const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/apotik')
    .then(() => console.log('✅ Connected ke MongoDB'))
    .catch(err => console.log(err));

module.exports = mongoose;