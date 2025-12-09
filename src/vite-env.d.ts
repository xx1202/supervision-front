/// <reference types="vite/client" />
declare module "*.vue" {
    import type { DefineComponent } from "vue";
    const vueComponent: DefineComponent<{}, {}, Record<string, unknown>>;
    export default vueComponent;
}