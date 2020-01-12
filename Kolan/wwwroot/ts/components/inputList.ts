import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';
import { FaIcon } from "fa-icons";

@customElement("input-list")
export class InputList extends LitElement {
    @property({ type: Array }) items = [];
    private inputPlaceholder: string;

    constructor(inputPlaceholder: string) {
        super();
        this.inputPlaceholder = inputPlaceholder;
    }

    render() {
        return html`
        <link rel="stylesheet" type="text/css" href="../css/components/dialog.css">
        <style>
            :host {
                font-family: "Inter", sans-serif;
            }

            :host .inputBlock {
                display: flex;
                flex-wrap: nowrap;
            }

            :host input {
                flex: 1;
                margin-bottom: 0;
                margin-right: 7px;
            }

            :host ul {
                width: 100%;
                height: 200px;
                border: 1px solid #9e9e9e;
                list-style: none;
                margin-left: 0;
                padding-left: 0;
                overflow: auto;
            }

            :host ul li {
                padding: 15px;
                border-bottom: 1px solid #9e9e9e;
            }

            :host li fa-icon {
                float: right;
                cursor: pointer;
            }
        </style>
        <section class="inputBlock">
            <input id="textInput" type="text" placeholder="${this.inputPlaceholder}" />
            <button @click="${(e) => this.addItem()}">Add</button>
        </section>
        <ul>
            ${this.items.map((item: string) => this.createItem(item))}
        </ul>
        `;
    }

    /**
     * Create the HTML for a list item.
     *
     * @name createItem
     * @function
     * @param {string} value
     * @returns {TemplateResult}
     */
    private createItem(value: string): TemplateResult {
        const li = document.createElement("LI");
        li.dataset.value = value;

        const span = document.createElement("SPAN");
        span.className = "itemValue";
        span.textContent = value;

        const faIcon = document.createElement("FA-ICON") as FaIcon;
        faIcon.className = "fas fa-times";
        faIcon.size = "20px";
        faIcon.pathPrefix = "/node_modules"
        faIcon.addEventListener("mouseover", (e) => this.handleIconMouseOver(e))
        faIcon.addEventListener("mouseout", (e) => this.handleIconMouseOut(e))
        faIcon.addEventListener("click", (e) => this.onRemoveClick(e))

        li.appendChild(span);
        li.appendChild(faIcon);

        return html`${li}`;
    }

    /**
     * Add a new item to the list and fire an event.
     *
     * @name addItem
     * @function
     * @returns {void}
     */
    private addItem(): void {
        const inputElement: HTMLInputElement = this.shadowRoot.getElementById("textInput") as HTMLInputElement;
        const value = inputElement.value;

        if (value.length == 0) return; // Don't add it if the input is empty

        this.items = [...this.items, value];
        inputElement.value = "";

        if (dispatchEvent) {
            this.dispatchEvent(new CustomEvent("itemAdded", {
                bubbles: true,  // Let the event be listened to from outside a web component, eg. dialog-box
                composed: true,
                detail: {
                    value: value,
                    object: this
                }
            }));
        }
    }

    public undo(): void {
        const lastItem = this.items[this.items.length - 1];
        this.items = this.items.filter((item: string) => item != lastItem);
    }

    private handleIconMouseOver(e): void {
        e.target.color = "red";
    }

    private handleIconMouseOut(e): void {
        e.target.color = "black";
    }

    private onRemoveClick(e: Event): void {
        const itemElement = (e.target as HTMLElement).parentElement;
        const itemValue = itemElement.dataset.value;
        const index = this.items.findIndex((value) => value == itemValue);
        this.items = this.items.filter((item: string) => item != itemValue); // Remove from list, give back a list without the item. Needs optimization.

        this.dispatchEvent(new CustomEvent("itemRemoved", {
            bubbles: true,
            composed: true,
            detail: {
                value: itemValue,
                index: index
            }
        }));
    }
}
