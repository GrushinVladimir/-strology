const mongoose = require('mongoose');  

const testResultSchema = new mongoose.Schema({  
    userId: { type: String, required: true },  
    answers: { type: [Number], required: true }, // массив ответов  
    dateCompleted: { type: Date, default: Date.now },  
});  

const TestResult = mongoose.model('TestResult', testResultSchema);  

module.exports = TestResult;  