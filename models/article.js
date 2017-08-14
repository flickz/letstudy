var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ArticleSchema = new mongoose.Schema({
	articleTitle: String,
	articleBody: String,
	writtenBy: String,
	courseCode: String,
	writtenOn: {type: Date, default: Date.now},
	readersNum: {type:Number, default: 0}
})

mongoose.model('Article', ArticleSchema);