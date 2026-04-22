"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";

export function LinkedInPageLink(
    {
        as: _Component = Block
    }
) {
    return (
        <div
            className={DEVLINK_SCOPE_CLASS}
            style={{
                display: "contents"
            }}><_Component tag="div">{"LinkedIn"}</_Component></div>
    );
}