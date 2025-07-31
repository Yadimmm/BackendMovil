"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Door = void 0;
const mongoose_1 = require("mongoose");
const DoorSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    state: {
        type: String,
        enum: ["open", "close"],
        required: true,
        default: "close"
    }
}, { timestamps: true });
exports.Door = (0, mongoose_1.model)('Door', DoorSchema);
// cambios muy externos
