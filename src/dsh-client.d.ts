/**
 * Ambient types for the DSH browser module loader and the plugin Client context.
 * Signatures mirror what `cordis_inspect_query` reports for the Client services
 * (slots / locale / timer); keep them in sync when the harness changes.
 */

type LoaderRequire = (id: string) => unknown;

/** The slice of React the clock component uses; provided by the loader's module table. */
interface ReactLike {
  createElement(
    type: string,
    props: Record<string, unknown> | null,
    ...children: unknown[]
  ): unknown;
  useState<T>(initial: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];
  useEffect(effect: () => void | (() => void), deps: readonly unknown[]): void;
  useLayoutEffect(effect: () => void | (() => void), deps: readonly unknown[]): void;
  useRef<T>(initial: T): { current: T };
}

type SlotInjectionEffect = unknown;

interface DshSlotOptions {
  name: string;
  id: string;
  order?: number;
  label?: string | (() => string);
}

interface DshClientContext {
  slots: {
    inject(key: string, callback: () => SlotInjectionEffect): () => void;
    register(options: DshSlotOptions, component: () => unknown): unknown;
  };
  locale: {
    register(namespace: string, locale: string, dict: Record<string, string>): () => void;
    bind(namespace: string): (key: string) => string | undefined;
    subscribe(callback: () => void): () => void;
    getLocale(): unknown;
  };
  timer: {
    interval(callback: () => void, delay: number): () => void;
    timeout(callback: () => void, delay: number): () => void;
  };
}

interface DshClientModule {
  inject?: string[];
  apply(ctx: DshClientContext): void | (() => void);
}

interface Window {
  __ModuleLoader__: {
    load(definition: {
      id: string;
      factory: (require: LoaderRequire) => DshClientModule;
    }): void;
  };
}
