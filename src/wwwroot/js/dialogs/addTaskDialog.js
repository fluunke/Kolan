"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inputType_1 = require("../enums/inputType");
/** Dialog template for adding board items
 */
exports.addTaskDialog = {
    title: "Add Task",
    primaryButton: "Add",
    inputs: [
        {
            key: "title",
            value: "Task title",
            inputType: inputType_1.InputType.Text
        },
        {
            key: "description",
            value: "Task description",
            inputType: inputType_1.InputType.Text
        }
    ]
};
