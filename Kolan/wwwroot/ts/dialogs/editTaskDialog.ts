import { DialogBox } from "../components/dialogBox";
import { LitElement, property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardHub } from "../communication/boardHub";

@customElement("edit-task-dialog")
export class EditTaskDialog extends DialogBox {
    @property({type: String}) boardId;
    @property({type: Array<object>()}) fields = [
        {
            key: "name",
            value: "Task title",
            inputType: InputType.Text
        },
        {
            key: "description",
            value: "Task description",
            inputType: InputType.TextArea
        }
    ];
    @property({type: Object}) options = {
        title: "Edit Task",
        primaryButton: "Edit"
    }

    submitHandler(): void {
        let task = this.getFormData();
        task["id"] = this.boardId;

        new BoardHub().editTask(task);
        this.hide();
    }
}
