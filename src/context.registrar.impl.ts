import { DrekContext } from './context';

/**
 * @internal
 */
export type DrekContext$Registrar = (this: void, context: DrekContext) => void;

let DrekContext$registrar = DrekContext$autoRegister;

/**
 * @internal
 */
export function DrekContext$register(context: DrekContext): void {
  DrekContext$registrar(context);
}

/**
 * @internal
 */
export function DrekContext$setRegistrar(registrar: DrekContext$Registrar): () => DrekContext$Registrar {

  const priorRegistrar = DrekContext$registrar;

  DrekContext$registrar = registrar;

  return priorRegistrar === DrekContext$autoRegister
      ? () => {
        DrekContext$registrar = priorRegistrar;
        return DrekContext$dontRegister;
      }
      : () => DrekContext$registrar = priorRegistrar;
}

function DrekContext$dontRegister(_context: DrekContext): void {
  // Do not auto-register the context already failed to lift.
}

let DrekContext$autoRegistrar = DrekContext$autoRegisterFirst;

function DrekContext$autoRegister(context: DrekContext): void {
  DrekContext$autoRegistrar(context);
}

function DrekContext$autoRegisterFirst(context: DrekContext): void {

  const registered: DrekContext[] = [context];

  DrekContext$autoRegistrar = DrekContext$createAutoRegistrar(registered);
  Promise.resolve().then(() => {
    DrekContext$autoRegistrar = DrekContext$autoRegisterFirst;
    for (const context of registered) {
      context.lift();
    }
  }).catch(console.error);
}

function DrekContext$createAutoRegistrar(registered: DrekContext[]): (context: DrekContext) => void {
  return context => registered.push(context);
}
