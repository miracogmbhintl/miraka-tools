import * as React from "react";
import * as Types from "./webflow_modules/types";

declare function Link(
    props: {
        as?: React.ElementType;
        link?: Types.Basic.Link;
        text?: React.ReactNode;
    }
): React.JSX.Element