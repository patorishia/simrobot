//models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true }
});

// Campo virtual só para input
userSchema.virtual('password')
  .set(function(password) {
    this._password = password;
  })
  .get(function() {
    return this._password;
  });

// Pre-save
userSchema.pre('save', async function(next) {
  if (this._password) {
    this.passwordHash = await bcrypt.hash(this._password, 10);
  }
  next();
});


module.exports = mongoose.model('User', userSchema);
