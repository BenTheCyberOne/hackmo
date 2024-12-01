const mongoose = require("mongoose")


const {MONGO_URI} = process.env;



exports.connect = () => {
	mongoose
		.connect(MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log("Successfully connected to database!");
		})
		.catch((error) => {
			console.log("database connection has failed. Exiting now...");
			console.error(error);
			process.exit(1);
		});
};

exports.getTransactions = async function(query){
	var deets = await getTransactions(query);
	return deets;
}

async function getTransactions(query) {
  try {
    const collection = mongoose.connection.db.collection('Transactions');
    const transactions = await collection.find(query);
    console.log(transactions);
    return transactions;
  } catch (error) {
    throw new Error(`Error finding transactions: ${error.message}`);
  }
}

exports.newDB = async function(User, Transaction) {
	await newDB(User, Transaction);
}

var newDB = async function(User, Transaction){
	var time = new Date();
	try {
		/*
		//await User.deleteMany({});
		await Host.deleteMany({});
		//await Host.dropIndex('domainName_text_ip_text_contact_text_groups_text');
		console.log("Emptied MongoDB Collections!");
		console.log("Creating default DB now...");
		const user1 = await User.create({
			firstName: "Ben",
			lastName: "Eldritch",
			email: "benjamin.eldritch@rtx.com",
			apiToken: "abcdefghijklmnopqrstuvwxyz1234567890",
			password: "$2a$10$O0mnOrr55Xxp/NnMbBP7HO/Q1hpjy5HrvRZGUFZkTZmcGQdtvevea" //nonagoninfinity
		});
		console.log("Created Ben Eldritch");
		console.log("Done creating users!");
		console.log("Creating test hosts...");
		const host1 = await Host.create({
			domainName: "test.rtx.com",
			ip: ["10.0.0.1", "10.0.1.1"],
			topLevelDomain: "rtx.com",
			subDomains: ["qa.test.rtx.com", "stage-01.test.rtx.com"],
			openPorts: [{portNum: "80", identifiedService: "Apache", lastCheckedDate: time, notes: "/solr/admin open to public"}, {portNum: "443", identifiedService: "Apache 2.7.4", lastCheckedDate: time}],
			bu: "RTX",
			contact: "benjamin.eldritch@rtx.com",
			cycleData: [{cycleNumber: "1", assignedTo: "Ben Eldritch", dateStarted: time, dateFinished: null}],
			observations: [{dateFound: time, title: "Test finding 1", severity: "Critical", details: "This is a test critical finding!", furtherInvestigationNeeded: true, lastModified: time, lastModifiedBy: "benjamin.eldritch@rtx.com", artifacts: [{title: "Test Artifact 1", dateAdded: time, data: "Data in artifact 1"}]}, {dateFound: time, title: "Test Finding 2", severity: "Low", details: "Details for Test Finding 2!",furtherInvestigationNeeded: false}],

		});
		console.log("Done creating test host!");
		*/
		console.log("Creating search indexes...")
		//create search-by index
		Transaction.collection.createIndex({domainName: "text", ip: "text", contact: "text", groups: "text"});
		console.log("Done creating indexes!");
		console.log("Done setting up default DB!");
	} catch(err) {
		console.log(err);
	}
}

/*
exports.newDB = async (User, Request) => {
	try {
		User.deleteMany({});
		Request.deleteMany({});
		console.log("Emptied MongoDB Collections!");
	} catch(err) {
		console.log(err);
	}
}
*/
