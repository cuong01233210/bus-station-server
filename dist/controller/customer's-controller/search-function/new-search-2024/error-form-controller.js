"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteError = exports.updateError = exports.createError = exports.getOneError = exports.getAllErrors = void 0;
const error_form_1 = __importDefault(require("../../../../models/error-form"));
// Get all error forms
const getAllErrors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = yield error_form_1.default.getAllErrors();
        res.status(200).json(errors);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve error forms", error });
    }
});
exports.getAllErrors = getAllErrors;
// Get a single error form by ID
const getOneError = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const error = yield error_form_1.default.getOneError(id);
        if (error) {
            res.status(200).json(error);
        }
        else {
            res.status(404).json({ message: "Error form not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve error form", error });
    }
});
exports.getOneError = getOneError;
// Create a new error form
const createError = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { source, destination, busName, time, date, errorDescription } = req.body;
    try {
        const newError = new error_form_1.default(source, destination, busName, time, date, errorDescription);
        yield newError.createError();
        res.status(200).json({ message: "Error form created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create error form", error });
    }
});
exports.createError = createError;
// Update an existing error form by ID
const updateError = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { source, destination, busName, time, date, errorDescription } = req.body;
    try {
        const errorForm = new error_form_1.default(source, destination, busName, time, date, errorDescription, id);
        yield errorForm.updateError(id);
        res.status(200).json({ message: "Error form updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update error form", error });
    }
});
exports.updateError = updateError;
// Delete an error form by ID
const deleteError = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield error_form_1.default.deleteError(id);
        res.status(200).json({ message: "Error form deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete error form", error });
    }
});
exports.deleteError = deleteError;
