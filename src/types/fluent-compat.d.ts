// This is a duplicate of fluent and should always match it

declare module 'fluent/compat' {
    // Type definitions for fluent 0.11
    // Project: http://projectfluent.org
    // Definitions by: Huy Nguyen <https://github.com/huy-nguyen>, James Nimlos <https://github.com/jamesnimlos>
    // Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
    // TypeScript Version: 2.2
    interface FluentBundleContructorOptions {
        functions?: object;
        useIsolating?: boolean;
        transform?: (...args: any[]) => any;
    }

    class FluentType {
        constructor(value: any, opts: object);
        toString(bundle: FluentBundle): string;
        valueOf(): any;
    }

    class FluentNone extends FluentType  {}
    class FluentNumber extends FluentType {}
    class FluentDateTime extends FluentType {}

    type FluentNode = FluentType | string;

    class FluentResource extends Map {
        static fromString(source: string): FluentResource;
    }

    class FluentBundle {
        constructor(locales: string | string[], options?: FluentBundleContructorOptions);
        locales: string[];
        messages: IterableIterator<[string, FluentNode[]]>;
        hasMessage(id: string): boolean;
        addMessages(source: string): string[];
        getMessage(id: string): FluentNode[] | undefined;
        format(message: FluentNode[], args?: object, errors?: Array<string | Error>): string;
        addResource(res: FluentResource): string[];
    }

    function ftl(strings: TemplateStringsArray): string;
}
