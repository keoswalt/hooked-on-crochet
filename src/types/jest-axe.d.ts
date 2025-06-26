declare module "jest-axe" {
  import { AxeResults, AxeRunOptions } from "axe-core";
  export function axe(node: HTMLElement | Document, options?: AxeRunOptions): Promise<AxeResults>;
} 