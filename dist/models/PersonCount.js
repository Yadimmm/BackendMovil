"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonCount = void 0;
const mongoose_1 = require("mongoose");
const PersonCountSchema = new mongoose_1.Schema({
    timestamp: { type: Date, required: true },
    sensorType: { type: String, required: true },
    direction: { type: String, required: true },
    location: { type: String, required: true },
    detectedObject: { type: String, required: true },
    counterValue: { type: Number, required: true },
    deviceId: { type: String, required: true }
});
exports.PersonCount = (0, mongoose_1.model)('PersonCount', PersonCountSchema);
