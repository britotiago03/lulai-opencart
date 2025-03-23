"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAPIkey = generateAPIkey;
var crypto_1 = require("crypto");
function generateAPIkey(length) {
    if (length === void 0) { length = 32; }
    var apiKey = (0, crypto_1.randomBytes)(length).toString('hex');
    console.log("Your API key: ", apiKey);
    return apiKey;
}
generateAPIkey();
