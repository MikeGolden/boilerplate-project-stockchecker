const mongoose = require('mongoose')
const mySecret = process.env['MONGO_URI']

const db = mongoose.connect(mySecret, { useNewUrlParser: true, useUnifiedTopology: true })


module.exports = db