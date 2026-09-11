import type { MDXComponents } from "mdx/types";
import { createElement } from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: (props) => createElement("pre", { tabIndex: 0, ...props }),
    ...components,
  };
}
