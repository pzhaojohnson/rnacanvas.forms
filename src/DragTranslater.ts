import * as styles from './DragTranslater.css';

export type Vector = {
  x: number;
  y: number;
};

/**
 * Allows the user to drag a target form using the mouse.
 *
 * This class translates forms using the (inline) `translate` CSS property.
 *
 * Thus, target forms should not otherwise make any use of the `translate` CSS property
 * when this class is applied to them.
 *
 * This class will only respond to mouse dragging initiated directly on the target form DOM node
 * (i.e., the target of the initiating mouse down event must be the target form DOM node).
 *
 * One way to "forward" mouse down events from child nodes in a form to the form node itself
 * is by setting the `pointer-events` CSS property of child nodes to `none`.
 *
 * Be careful when doing this, though, since the `pointer-events` CSS property is inherited
 * and could make unintended elements of a form impossible to interact with
 * (that the user is supposed to be able to interact with).
 *
 * To overrule an inherited `pointer-events` style of `none`,
 * explicitly set the `pointer-events` CSS property to `auto` on an element.
 *
 * This class will also (transiently) give the target form DOM node a `grab` cursor style
 * when the target form DOM node is being directly hovered with the mouse.
 */
export class DragTranslater {
  /**
   * The mouse recent mouse down event.
   */
  private lastMouseDown: MouseEvent | undefined;

  /**
   * Set to true when the mouse is down.
   */
  private mouseIsDown = false;

  /**
   * The depth of interaction with the target form.
   *
   * When set to "shallow", the drag translater only responds
   * to clicks on the target form node itself.
   *
   * When set to "deep", the drag translater responds to clicks
   * anywhere within the target form, including on child elements.
   */
  interactionDepth: 'shallow' | 'deep' = 'shallow';

  constructor(private targetForm: HTMLElement) {
    window.addEventListener('mousedown', event => this.handleMouseDown(event));

    window.addEventListener('mousemove', event => this.handleMouseMove(event));

    window.addEventListener('mouseup', event => this.handleMouseUp(event));

    targetForm.addEventListener('mouseover', event => {
      event.target === targetForm ? targetForm.classList.add(styles['grab-cursor']) : {};
    });

    targetForm.addEventListener('mouseout', event => {
      event.target === targetForm ? targetForm.classList.remove(styles['grab-cursor']) : {};
    });
  }

  /**
   * The current translation of the target form
   * as defined solely by the `translate` CSS property.
   */
  get currentTranslation(): Vector {
    let translatedClientRect = this.targetForm.getBoundingClientRect();
    let translatedX = translatedClientRect.x;
    let translatedY = translatedClientRect.y;

    // cache `translate` CSS property
    let translate = this.targetForm.style.translate;

    // remove all translation
    this.targetForm.style.translate = '0px 0px';

    let untranslatedClientRect = this.targetForm.getBoundingClientRect();
    let untranslatedX = untranslatedClientRect.x;
    let untranslatedY = untranslatedClientRect.y;

    // restore translation
    this.targetForm.style.translate = translate;

    return {
      x: translatedX - untranslatedX,
      y: translatedY - untranslatedY,
    };
  }

  set currentTranslation(currentTranslation) {
    this.targetForm.style.translate = `${currentTranslation.x}px ${currentTranslation.y}px`;
  }

  /**
   * Sets the `translate` CSS property of the target form to `0px 0px`.
   */
  untranslate(): void {
    this.targetForm.style.translate = '0px 0px';
  }

  private handleMouseDown(event: MouseEvent): void {
    this.lastMouseDown = event;

    this.mouseIsDown = true;
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.mouseIsDown) { return; }

    if (!this.lastMouseDown) { return; }
    if (!(this.lastMouseDown.target instanceof Node)) { return; }

    if (this.interactionDepth == 'shallow') {
      if (this.lastMouseDown.target !== this.targetForm) { return; }
    } else {
      if (!this.targetForm.contains(this.lastMouseDown.target)) { return; }
    }

    let currentTranslation = this.currentTranslation;

    this.currentTranslation = {
      x: currentTranslation.x + event.movementX,
      y: currentTranslation.y + event.movementY,
    };
  }

  private handleMouseUp(event: MouseEvent): void {
    this.mouseIsDown = false;
  }
}
