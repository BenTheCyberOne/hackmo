const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema({
	timestamp: {type: Date},
	sender: {type: String},
	receiver: {type: String},
	amount: {type: Number},
	comment: {type: String}

});

module.exports = mongoose.model("transactions",transactionsSchema);
