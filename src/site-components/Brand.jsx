"use client";
import React from "react";
import * as _Builtin from "./_Builtin";

export function Brand(
    {
        as: _Component = _Builtin.Link
    }
) {
    return (
        <_Component
            className="brand"
            id="w-node-d9edca0f-ca85-01e2-d28e-9f4c99b6d82d-99b6d82d"
            button={false}
            block="inline"
            options={{
                href: "https://miraka.ch/"
            }}><_Builtin.Image
                className="logo"
                loading="lazy"
                width="auto"
                height="auto"
                alt="Miraka & Co plain text black logo on a transparent background."
                src="https://cdn.prod.website-files.com/68dc2b9c31cb83ac9f84a1af/68e0480bc44f1d28032afb51_LOGO%20MIRAKA%20%26%20CO%20PLAIN%20TEXT.png" /></_Component>
    );
}