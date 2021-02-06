import { Widget } from "@lumino/widgets";

export namespace TreeView {

    export
        class TreeView extends Widget {
        constructor() {
            super({ node: Private.createNode() });
            this.setFlag(Widget.Flag.DisallowLayout);
            this.addClass('lm-treeview');
            let list = document.createElement('ul');
            for (let i = 0; i < 100; i++) {
                let li = document.createElement('li');
                li.innerHTML = "List item " + i;
                list.append(li);
            }
            this.node.append(list);
        }

        static createNode(): HTMLElement {
            let node = document.createElement('div');
            let content = document.createElement('div');
            node.appendChild(content);
            return node;
        }
    }
}

namespace Private {
    export
        function createNode(): HTMLDivElement {
        let node = document.createElement('div');
        return node;
    }
}