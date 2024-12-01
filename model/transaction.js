const mongoose = require("mongoose");

const TransactionsSchema = new mongoose.Schema({
	timestamp: {type: Date},
	sender: {type: String},
	receiver: {type: String},
	amount: {type: Number},
	comment: {type: String}

});

module.exports = mongoose.model("transactions",transactionsSchema);