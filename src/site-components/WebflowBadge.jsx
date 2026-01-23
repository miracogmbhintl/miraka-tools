"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function WebflowBadge(
    {
        as: _Component = _Builtin.Link
    }
) {
    return (
        <_Component
            className="badge-wrap"
            button={false}
            block="inline"
            options={{
                href: "https://webflow.com/templates/designers/slate-dept"
            }}><_Builtin.Block className="webflow-badge" tag="div"><_Builtin.Image
                    className="badge-image"
                    width="auto"
                    height="auto"
                    loading="lazy"
                    alt=""
                    src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68dc2b9d31cb83ac9f84a213_webflow-badge-icon-d2.89e12c322e.svg" /><_Builtin.Block tag="div"><_Builtin.Strong>{"Get Template"}</_Builtin.Strong></_Builtin.Block></_Builtin.Block></_Component>
    );
}