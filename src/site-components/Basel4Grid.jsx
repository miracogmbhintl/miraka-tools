"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";
import Grid from "./webflow_modules/Layout/components/Grid";
import Section from "./webflow_modules/Layout/components/Section";
import * as _interactions from "./webflow_modules/interactions";

const _interactionsData = JSON.parse(
    '{"events":{"e-118":{"id":"e-118","name":"","animationType":"preset","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"SLIDE_EFFECT","instant":false,"config":{"actionListId":"slideInBottom","autoStopEventId":"e-119"}},"mediaQueries":["main","medium","small","tiny"],"target":{"selector":".cf-growth-wrapper","originalId":"2bc72328-3cb0-a29c-7a43-ed7a98a95b39","appliesTo":"CLASS"},"targets":[{"selector":".cf-growth-wrapper","originalId":"2bc72328-3cb0-a29c-7a43-ed7a98a95b39","appliesTo":"CLASS"}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":5,"scrollOffsetUnit":"%","delay":0,"direction":"BOTTOM","effectIn":true},"createdOn":1649953593458}},"actionLists":{"slideInBottom":{"id":"slideInBottom","useFirstGroupAsInitialState":true,"actionItemGroups":[{"actionItems":[{"actionTypeId":"STYLE_OPACITY","config":{"delay":0,"duration":0,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"value":0}}]},{"actionItems":[{"actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"duration":0,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"xValue":0,"yValue":100,"xUnit":"PX","yUnit":"PX","zUnit":"PX"}}]},{"actionItems":[{"actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"outQuart","duration":1000,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"xValue":0,"yValue":0,"xUnit":"PX","yUnit":"PX","zUnit":"PX"}},{"actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"outQuart","duration":1000,"target":{"id":"N/A","appliesTo":"TRIGGER_ELEMENT","useEventTarget":true},"value":1}}]}]}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function Basel4Grid(
    {
        as: _Component = Section,
        text1 = "",
        text10 = "Wir fokussieren nicht nur die Aufgabe, sondern den Kern Ihrer Vision.",
        text2 = "Basel lebt vo starke Unternehme, engagierte Verein und guete Initiative. Mir helfe debi, dass die professioneller uftrete, besser gseh werde und langfristig meh us ihrere Präsenz usehole.",
        text3 = "Unternehme",
        text4 = "Für Unternehme us Basel, wo ihre Uuftritt modernisiere, sichtbarer werde und digital besser ufstellt sii wend.",
        text5 = "",
        text6 = "Für Verein, wo meh Reichwiite, e professionellere Uuftritt und e klareri Kommunikation bruuche.",
        text7 = "",
        text8 = "Für Idee, Events und regionali Projekt, wo meh Aufmerksamkeit und e starchi Basis verdiene.",
        text9 = ""
    }
) {
    _interactions.useInteractions(_interactionsData);

    return (
        <div
            className={DEVLINK_SCOPE_CLASS}
            style={{
                display: "contents"
            }}><_Component
                className="cf-growth-section"
                grid={{
                    type: "section"
                }}
                tag="div"><Block className="cf-wrapper-1160 growth-flex" tag="div"><Block className="cf-growth-container" tag="div"><Grid className="cf-growth-grid" tag="div"><Block
                                className="cf-growth-wrapper large _1 basel"
                                id="w-node-a2f60a56-24a6-eb2a-c9dc-d89490cf3072-90cf306e"
                                tag="div"><Block className="cf-growth-h2-heading-56px" tag="div">{text1}</Block><Block className="cf-growth-para-text-20px" tag="div">{text2}</Block></Block><Block
                                className="cf-growth-wrapper basel"
                                id="w-node-a2f60a56-24a6-eb2a-c9dc-d89490cf3078-90cf306e"
                                tag="div"><Block className="cf-growth-heading-32px" tag="div">{text3}</Block><Block className="cf-growth-para-text-18px" tag="div">{text4}</Block></Block><Block className="cf-growth-wrapper" tag="div"><Block className="cf-growth-heading-32px" tag="div">{text5}</Block><Block className="cf-growth-para-text-18px" tag="div">{text6}</Block></Block><Block
                                className="cf-growth-wrapper"
                                id="w-node-a2f60a56-24a6-eb2a-c9dc-d89490cf3083-90cf306e"
                                tag="div"><Block className="cf-growth-heading-32px" tag="div">{text7}</Block><Block className="cf-growth-para-text-18px" tag="div">{text8}</Block></Block><Block className="cf-growth-wrapper" tag="div"><Block className="cf-growth-heading-32px" tag="div">{text9}</Block><Block className="cf-growth-para-text-18px" tag="div">{text10}</Block></Block></Grid></Block></Block></_Component></div>
    );
}