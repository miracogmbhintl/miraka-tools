"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";

export function ColorPalett(
    {
        as: _Component = Block
    }
) {
    return (
        <div
            className={DEVLINK_SCOPE_CLASS}
            style={{
                display: "contents"
            }}><_Component
                className="colors-list"
                id="w-node-_5a62a39d-9b89-e4e7-3ada-a98a591d6139-591d6139"
                tag="div"><Block
                    className="color-block"
                    id="w-node-_5a62a39d-9b89-e4e7-3ada-a98a591d613a-591d6139"
                    tag="div" /><Block
                    className="color-block _2"
                    id="w-node-_5a62a39d-9b89-e4e7-3ada-a98a591d613b-591d6139"
                    tag="div" /><Block
                    className="color-block _3"
                    id="w-node-_5a62a39d-9b89-e4e7-3ada-a98a591d613c-591d6139"
                    tag="div" /><Block
                    className="color-block _4"
                    id="w-node-_5a62a39d-9b89-e4e7-3ada-a98a591d613d-591d6139"
                    tag="div" /><Block
                    className="color-block _5"
                    id="w-node-_5a62a39d-9b89-e4e7-3ada-a98a591d613e-591d6139"
                    tag="div" /></_Component></div>
    );
}