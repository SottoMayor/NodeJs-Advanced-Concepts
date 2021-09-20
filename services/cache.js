const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function() {
    console.log('Execution into the mongoose.Query.prototype.exec');

    return exec.apply(this, arguments);
}