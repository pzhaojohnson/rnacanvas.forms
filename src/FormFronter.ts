/**
 * Brings the target form to the front of its parent node (i.e., makes it the last child of its parent node)
 * when the user interacts with the target form (e.g., in response to mouse down events).
 */
export class FormFronter {
  constructor(private targetForm: Node) {
    targetForm.addEventListener('mousedown', () => this.bringToFront());
  }

  private bringToFront(): void {
    // nothing to do if the target form has no parent node
    let parentNode = this.targetForm.parentNode;
    if (!parentNode) { return; }

    // nothing to do if the target form is already the last child (is already at the front)
    let lastChild = parentNode.lastChild;
    if (lastChild === this.targetForm) { return; }

    // make the target form the last child
    parentNode.appendChild(this.targetForm);
  }
}
