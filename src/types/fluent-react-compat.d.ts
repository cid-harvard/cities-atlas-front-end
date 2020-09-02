// This is a duplicate of fluent-react and should always match it

declare module 'fluent-react/compat' {
// Type definitions for fluent-react 0.8
// Project: http://projectfluent.org
// Definitions by: Huy Nguyen <https://github.com/huy-nguyen>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.3
  interface Node {
    TEXT_NODE: 3;
    nodeType: number;
    localName?: string;
    textContext: string;
  }

  type MarkupParser = (str: string) => Node[];

  interface Context {
    l10n: ReactLocalization;
    parseMarkup: MarkupParser;
  }
  interface LocalizationProviderProps {
    bundles: IterableIterator<FluentBundle>;
    parseMarkup?: MarkupParser;
  }
  class LocalizationProvider extends React.Component<LocalizationProviderProps> {
  }

  class ReactLocalization {
    constructor(bundles: IterableIterator<FluentBundle>);
    getString(id: string, args?: object, fallback?: string): string;
  }

  interface LocalizedProps {
    id: string;
    attrs?: object;
    [key: string]: any;
  }

  class Localized extends React.Component<LocalizedProps> {
  }

  // Inspired by react-redux's type definition:
  /**
   * A property P will be present if:
   * - it is present in DecorationTargetProps
   *
   * Its value will be dependent on the following conditions
   * - if property P is present in InjectedProps and its definition extends the definition
   *   in DecorationTargetProps, then its definition will be that of DecorationTargetProps[P]
   * - if property P is not present in InjectedProps then its definition will be that of
   *   DecorationTargetProps[P]
   * - if property P is present in InjectedProps but does not extend the
   *   DecorationTargetProps[P] definition, its definition will be that of InjectedProps[P]
   */
  type Matching<InjectedProps, DecorationTargetProps> = {
    [P in keyof DecorationTargetProps]: P extends keyof InjectedProps
      ? InjectedProps[P] extends DecorationTargetProps[P]
        ? DecorationTargetProps[P]
        : InjectedProps[P]
      : DecorationTargetProps[P];
  };

  /**
   * a property P will be present if :
   * - it is present in both DecorationTargetProps and InjectedProps
   * - InjectedProps[P] can satisfy DecorationTargetProps[P]
   * ie: decorated component can accept more types than decorator is injecting
   *
   * For decoration, inject props or ownProps are all optionally
   * required by the decorated (right hand side) component.
   * But any property required by the decorated component must be satisfied by the injected property.
   */
  type Shared<
      InjectedProps,
      DecorationTargetProps
      > = {
          [P in Extract<keyof InjectedProps, keyof DecorationTargetProps>]?: InjectedProps[P] extends DecorationTargetProps[P] ? DecorationTargetProps[P] : never;
      };

  // Infers prop type from component C
  type GetProps<C> = C extends React.ComponentType<infer P> ? P : never;

  type GetString = (id: string, args?: object) => string;

  interface InjectedProps {
    getString: GetString;
  }

  // Taken from
  // https://github.com/Microsoft/TypeScript/wiki/What%27s-new-in-TypeScript#predefined-conditional-types
  type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

  // Injects `getString` and removes it from the prop requirements. Will not pass
  // through `getString` if it's passed in during render.
  function withLocalization<C extends React.ComponentType<Matching<InjectedProps, GetProps<C>>>>(
    component: C
  ): React.ComponentType<Omit< GetProps<C>, keyof Shared<InjectedProps, GetProps<C>>>>;
}
