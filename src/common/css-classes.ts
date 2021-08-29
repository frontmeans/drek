import { css__naming, QualifiedName } from '@frontmeans/namespace-aliaser';
import { Supply, SupplyPeer } from '@proc7ts/supply';
import { DrekContext } from '../context';
import { drekContextOf } from '../context-of';

/**
 * An accessor to CSS classes of some element.
 *
 * Can be obtained by {@link drekCssClassesOf} function.
 */
export interface DrekCssClasses {

  /**
   * Adds CSS class to target element.
   *
   * The same CSS class can be supplied multiple times. In this case the class would be removed when no more suppliers
   * left.
   *
   * Utilizes a {@link DrekContext.nsAlias namespace aliaser} of element rendering context for resolving class names.
   *
   * {@link DrekContext.scheduler Schedules} element CSS updates via element rendering context.
   *
   * @param className - CSS class name to add. Either a string or qualified one.
   * @param user - A supply peer of the CSS class. When specified, its supply us returned from the method call.
   *
   * @returns Added CSS class supply that removes the class once cut off, unless there are other supplies of the same
   * class.
   */
  add(className: QualifiedName, user?: SupplyPeer): Supply;

  /**
   * Checks whether the target element has the given CSS class.
   *
   * @param className - CSS class name to check. Either a string or qualified one.
   *
   * @returns `true` if the target element has this class, or `false` otherwise.
   */
  has(className: QualifiedName): boolean;

  /**
   * Obtains CSS classes accessor using different rendering context.,
   *
   * @param context - A rendering context to use instead of the {@link drekContextOf default one}.
   *
   * @returns Either new CSS classes accessor instance, or `this` one if context is the same.
   */
  renderIn(context: DrekContext): DrekCssClasses;

}

const DrekCssClasses__symbol = (/*#__PURE__*/ Symbol('DrekCssClasses'));

interface DrekCssClasses$Holder extends Element {
  [DrekCssClasses__symbol]?: DrekCssClasses$ | undefined;
}

/**
 * Obtains CSS classes of the given element.
 *
 * @param element - Target element.
 *
 * @returns CSS classes accessor, either already existing or newly created one.
 */
export function drekCssClassesOf(element: Element): DrekCssClasses;

export function drekCssClassesOf(element: DrekCssClasses$Holder): DrekCssClasses {
  return element[DrekCssClasses__symbol]
      || (element[DrekCssClasses__symbol] = new DrekCssClasses$(element));
}

class DrekCssClasses$ implements DrekCssClasses {

  private readonly _context: DrekContext;
  private readonly _uses = new Map<string, DrekCssClasses$Use>();

  constructor(private readonly _element: Element) {
    this._context = drekContextOf(_element);
  }

  add(className: QualifiedName, user?: SupplyPeer): Supply {
    return this._add(this._context, className, user);
  }

  private _add(
      {
        nsAlias,
        scheduler,
      }: DrekContext,
      className: QualifiedName,
      user?: SupplyPeer,
  ): Supply {

    const supply = user ? user.supply : new Supply();

    if (supply.isOff) {
      return supply;
    }

    const name = css__naming.name(className, nsAlias);
    const schedule = scheduler({ node: this._element });
    const use = this._use(name);

    const render = (): void => {
      if (use.n) {
        if (!use.s) {
          this._element.classList.add(name);
          use.s = 1;
        }
      } else {
        if (use.s && !use.i) { // Do not remove the class if it present initially.
          this._element.classList.remove(name);
          use.s = 0;
        }
        this._uses.delete(name);
      }
    };

    if (use.n === 1) {
      schedule(render);
    }

    return supply.whenOff(() => {
      if (!--use.n) {
        schedule(render);
      }
    });
  }

  private _use(name: string): DrekCssClasses$Use {

    let use = this._uses.get(name);

    if (use) {
      ++use.n;
    } else {
      if (this._element.classList.contains(name)) {
        use = {
          i: 1,
          n: 1,
          s: 1,
        };
      } else {
        use = {
          i: 0,
          n: 1,
          s: 0,
        };
      }
      this._uses.set(name, use);
    }

    return use;
  }

  has(className: QualifiedName): boolean {
    return this._has(this._context, className);
  }

  private _has({ nsAlias }: DrekContext, className: QualifiedName): boolean {

    const name = css__naming.name(className, nsAlias);
    const use = this._uses.get(name);

    return use
        ? !!use.n || !!use.i
        : this._element.classList.contains(name);
  }

  renderIn(context: DrekContext): DrekCssClasses {
    return context !== this._context
        ? {
          add: className => this._add(context, className),
          has: className => this._has(context, className),
          renderIn: newContext => this.renderIn(newContext),
        }
        : this;
  }

}

interface DrekCssClasses$Use {
  readonly i: 0 | 1; // initially set
  n: number;         // number of uses
  s: 0 | 1;          // actually set
}
