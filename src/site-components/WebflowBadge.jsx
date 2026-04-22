"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";
import Image from "./webflow_modules/Basic/components/Image";
import Link from "./webflow_modules/Basic/components/Link";
import Strong from "./webflow_modules/Basic/components/Strong";

export function WebflowBadge(
    {
        as: _Component = Link
    }
) {
    return (
        <div
            className={DEVLINK_SCOPE_CLASS}
            style={{
                display: "contents"
            }}><_Component
                block="inline"
                button={false}
                className="badge-wrap"
                options={{
                    href: "https://webflow.com/templates/designers/slate-dept"
                }}><Block className="webflow-badge" tag="div"><Image
                        alt=""
                        className="badge-image"
                        height="auto"
                        loading="lazy"
                        src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68dc2b9d31cb83ac9f84a213_webflow-badge-icon-d2.89e12c322e.svg"
                        width="auto" /><Block tag="div"><Strong>{"Get Template"}</Strong></Block></Block></_Component></div>
    );
}