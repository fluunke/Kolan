import { DialogBox } from "../components/dialogBox";
import { ConfirmDialog } from "./confirmDialog";
import { property, customElement } from "lit-element";
import { InputType } from "../enums/inputType";
import { BoardView } from "../views/boardView";
import { ApiRequester } from "../communication/apiRequester";
import { RequestType } from "../enums/requestType";
import { ToastType } from "../enums/toastType";
import { ToastController } from "../controllers/toastController";
import { PermissionLevel } from "../enums/permissionLevel";
import { Task } from "../models/task";
import { ContentFormatter } from "../processing/contentFormatter";
import { RedirectTo } from "../views/redirectTo";

declare const viewData;

@customElement("settings-dialog")
export class SettingsDialog extends DialogBox {
    @property({type: Array<object>()}) fields = [
        {
            key: "name",
            value: "Title",
            inputType: InputType.Text
        },
        {
            key: "description",
            value: "Description",
            inputType: InputType.TextArea
        },
        {
            key: "inputList",
            title: "Edit columns",
            value: "Choose a column name...",
            inputType: InputType.InputList
        },
        {
            key: "deleteBoard",
            value: "Delete board",
            inputType: InputType.Button,
            red: true
        }
    ];
    @property({type: Object}) options = {
        title: "Board Settings",
        primaryButton: "Done"
    }
    private itemHasBeenMoved = false;
    private contentHasChanged = false;
    private itemAddedOrRemoved = false;

    constructor() {
        super();

        this.addEventListener("itemAdded", (e: CustomEvent) => this.onItemAdded(e));
        this.addEventListener("itemRemoved", (e: CustomEvent) => this.onItemRemoved(e));
        this.addEventListener("itemMoved", () => this.itemHasBeenMoved = true);
    }

    async submitHandler(): Promise<void> {
        // If eg. name or description has been changed, update this information.
        if (this.contentHasChanged) {
            const formData = this.getFormData();
            BoardView.board.content.name = formData["name"];
            BoardView.board.content.description = formData["description"];

            // Get the parent's id
            // If there are ancestors, get the last item in the ancestors list, this will be the parent id
            // Otherwise, there is no parent.
            const parentId = BoardView.board.ancestors.length > 0
                ? BoardView.board.ancestors[BoardView.board.ancestors.length - 1].id
                : null;
            
            try {
                // parentId is empty if there is no parent. The backend will understand this.
                await ApiRequester.boards.edit(
                    BoardView.board.content.id,
                    parentId,
                    BoardView.board.content
                );

                location.reload();
            } catch(err) {
                this.showErrors(JSON.parse(err.response));
            }
        }

        // Send a request to change the group order only if it has been changed.
        if (this.itemHasBeenMoved) {
            await ApiRequester.boards.changeGroupOrder(
                BoardView.board.content.id,
                this.list.items.map(x => x.id)
            );
        }

        if (this.itemHasBeenMoved || this.itemAddedOrRemoved) {
            await BoardView.boardHub.requestReload();
            location.reload(); // It won't automatically reload since the dialog is open
        }

        if (!this.contentHasChanged && !this.itemHasBeenMoved) this.hide();
    }

    async onOpen(): Promise<void> {
        // Change delete button to leave button if the board isn't owned by the user.
        const deleteButton = this.shadowRoot.querySelector(".deleteBoard");
        if (BoardView.board.userAccess != PermissionLevel.All) {
            if (BoardView.board.ancestors[-1]) {
                deleteButton.previousElementSibling.remove();
                deleteButton.remove();
            } else {
                deleteButton.previousElementSibling.innerHTML = "Leave board";
                deleteButton.innerHTML = "Leave";
                deleteButton.addEventListener("click", () => this.leaveBoard());
            }
        } else {
            deleteButton.addEventListener("click", async () => await this.deleteBoard());
        }

        const name = this.shadowRoot.querySelector("[name='name']") as HTMLInputElement;
        const description = this.shadowRoot.querySelector("[name='description']") as HTMLInputElement;

        // Set the values
        // TODO: Use the dialogbox.setValues() function for this...
        name.value = BoardView.board.content.name;
        description.value = BoardView.board.content.description;
        name.oninput = () => this.contentHasChanged = true;
        description.oninput = () => this.contentHasChanged = true;

        // Collect group names into a list
        const groupNames = [];
        for (const key in BoardView.tasklistControllers)
            groupNames.push({
                id: key,
                name: BoardView.tasklistControllers[key].name
            });

        this.list.items = groupNames;
        this.list.draggableItems = true;
    }

    private async deleteBoard(): Promise<void> {
        const confirmDialog = new ConfirmDialog("Are you sure you want to delete the board?", "Yes", true);
        document.body.appendChild(confirmDialog);

        confirmDialog.addEventListener("submitDialog", async () => {
            // Get parent if there is one
            const parentId = BoardView.board.ancestors.length > 0
                ? BoardView.board.ancestors[-1].id
                : null;

            // The backend will understand if parentId is null
            await ApiRequester.boards.delete(BoardView.board.content.id, parentId);
            if (parentId) RedirectTo.Board(parentId)
            else          RedirectTo.Boards();
        });
    }

    private async leaveBoard(): Promise<void> {
        await ApiRequester.boards.removeUser(BoardView.board.content.id, viewData.username);

        RedirectTo.Boards();
    }

    private async onItemAdded(e: CustomEvent): Promise<void> {
        const groupId = await ApiRequester.groups.add(BoardView.board.content, e.detail["value"]);
        this.list.items[this.list.items.length - 1].id = groupId;
    }

    private async onItemRemoved(e: CustomEvent): Promise<void> {
        const groupId = e.detail["item"].id;

        if (BoardView.tasklistControllers[groupId].tasklist.children.length > 0) {
            ToastController.new("Can only remove empty task lists.", ToastType.Warning);
            e.detail["object"].undoRemove();
        }

        await ApiRequester.groups.delete(BoardView.board.content.id, groupId);
    }
}
