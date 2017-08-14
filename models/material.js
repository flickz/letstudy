/**
 * @version 0.0.2
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Material = new mongoose.Schema({
	courseCode: String,
	courseTitle: String,
	level: String,
	topic: String,
	description: String,
	type: String,
	downloadLink: String,
	uploadedBy: String,
	uploadedAt: {type: Date, default: Date.now},
	downloadNum: {type: Number, default: 0}
});

const PdfMaterial = new mongoose.Schema({
    author: String,
    creator: String, 
    producer: String,
	courseCode: String, 
    creationdate: Number,
    pages: Number,
    page_size: String, 
    file_size: String
});

mongoose.model('Material', Material);
mongoose.model('PdfMaterial', PdfMaterial);