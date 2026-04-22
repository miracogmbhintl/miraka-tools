"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";
import Heading from "./webflow_modules/Basic/components/Heading";
import Link from "./webflow_modules/Basic/components/Link";

export function NotFound(
    {
        as: _Component = Block
    }
) {
    return (
        <div
            className={DEVLINK_SCOPE_CLASS}
            style={{
                display: "contents"
            }}><_Component className="utility-page-wrap" tag="div"><Block className="utility-page-content" tag="div"><Heading className="text---heading" tag="h2">{"404"}</Heading><Block tag="div">{"Oops! Nothing is here."}</Block><Link
                        block="inline"
                        button={false}
                        options={{
                            href: "https://miraka.ch/"
                        }}><Block className="back-to-home-button" tag="div">{"<-- Back to Home"}</Block></Link></Block></_Component></div>
    );
}