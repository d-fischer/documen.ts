export declare type HookClassKey<T> = T extends (props: any) => Record<infer S, string> ? S : never;
export declare type HookClassesOverride<HookType> = Partial<Record<HookClassKey<HookType>, string>>;
