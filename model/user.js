const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	username: {type: String, unique: true},
	password: {type: String, required: true},
	balance: {type: Number, default: 100},
	isAdmin: {type: Boolean, default: false}
});
userSchema.methods.comparePassword = function(password){
	return bcrypt.compareSync(password, this.password)
};

module.exports = mongoose.model("user",userSchema);