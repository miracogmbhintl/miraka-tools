"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function NotFound(
    {
        as: _Component = _Builtin.Block
    }
) {
    return (
        <_Component className="utility-page-wrap" tag="div"><_Builtin.Block className="utility-page-content" tag="div"><_Builtin.Heading className="text---heading" tag="h2">{"404"}</_Builtin.Heading><_Builtin.Block tag="div">{"Oops! Nothing is here."}</_Builtin.Block><_Builtin.Link
                    button={false}
                    block="inline"
                    options={{
                        href: "https://miraka.ch/"
                    }}><_Builtin.Block className="back-to-home-button" tag="div">{"<-- Back to Home"}</_Builtin.Block></_Builtin.Link></_Builtin.Block></_Component>
    );
}