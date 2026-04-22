"use client";
import React from "react";
import { DEVLINK_SCOPE_CLASS } from "./devlinkScope";
import Block from "./webflow_modules/Basic/components/Block";
import FormBlockLabel from "./webflow_modules/Form/components/FormBlockLabel";
import FormButton from "./webflow_modules/Form/components/FormButton";
import FormCheckboxInput from "./webflow_modules/Form/components/FormCheckboxInput";
import FormCheckboxWrapper from "./webflow_modules/Form/components/FormCheckboxWrapper";
import FormErrorMessage from "./webflow_modules/Form/components/FormErrorMessage";
import FormForm from "./webflow_modules/Form/components/FormForm";
import FormInlineLabel from "./webflow_modules/Form/components/FormInlineLabel";
import FormRadioInput from "./webflow_modules/Form/components/FormRadioInput";
import FormRadioWrapper from "./webflow_modules/Form/components/FormRadioWrapper";
import FormSelect from "./webflow_modules/Form/components/FormSelect";
import FormSuccessMessage from "./webflow_modules/Form/components/FormSuccessMessage";
import FormTextarea from "./webflow_modules/Form/components/FormTextarea";
import FormTextInput from "./webflow_modules/Form/components/FormTextInput";
import FormWrapper from "./webflow_modules/Form/components/FormWrapper";
import Grid from "./webflow_modules/Layout/components/Grid";
import Link from "./webflow_modules/Basic/components/Link";
import Paragraph from "./webflow_modules/Basic/components/Paragraph";
import Section from "./webflow_modules/Layout/components/Section";
import Span from "./webflow_modules/Basic/components/Span";
import * as _interactions from "./webflow_modules/interactions";

const _interactionsData = JSON.parse(
    '{"events":{"e-6":{"id":"e-6","name":"","animationType":"custom","eventTypeId":"PAGE_FINISH","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-4","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-5"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"wf-page-id","appliesTo":"PAGE","styleBlockIds":[]},"targets":[{"id":"wf-page-id","appliesTo":"PAGE","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":null,"scrollOffsetUnit":null,"delay":null,"direction":null,"effectIn":null},"createdOn":1713400299748},"e-22":{"id":"e-22","name":"","animationType":"custom","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-16","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-23"}},"mediaQueries":["main","medium","small","tiny"],"target":{"selector":".section","originalId":"1c3068db-c85b-0976-fc44-419e0ecc9488","appliesTo":"CLASS"},"targets":[{"selector":".section","originalId":"1c3068db-c85b-0976-fc44-419e0ecc9488","appliesTo":"CLASS"}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":30,"scrollOffsetUnit":"%","delay":null,"direction":null,"effectIn":null},"createdOn":1713462469647},"e-24":{"id":"e-24","name":"","animationType":"custom","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-16","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-25"}},"mediaQueries":["main","medium","small","tiny"],"target":{"selector":".footer","originalId":"a3257827-3808-7553-a661-173643d39b3a","appliesTo":"CLASS"},"targets":[{"selector":".footer","originalId":"a3257827-3808-7553-a661-173643d39b3a","appliesTo":"CLASS"}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":0,"scrollOffsetUnit":"%","delay":null,"direction":null,"effectIn":null},"createdOn":1713463928196},"e-89":{"id":"e-89","name":"","animationType":"preset","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-34","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-90"}},"mediaQueries":["main","medium","small","tiny"],"target":{"selector":".section","originalId":"68e1858662070af5477770bf|fe8ea54a-d04e-5263-edbf-e02c427a0011","appliesTo":"CLASS"},"targets":[{"selector":".section","originalId":"68e1858662070af5477770bf|fe8ea54a-d04e-5263-edbf-e02c427a0011","appliesTo":"CLASS"}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":30,"scrollOffsetUnit":"%","delay":null,"direction":null,"effectIn":null},"createdOn":1759613202871},"e-105":{"id":"e-105","name":"","animationType":"preset","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-45","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-106"}},"mediaQueries":["main","medium","small","tiny"],"target":{"selector":".section","originalId":"68dc2b9d31cb83ac9f84a1fc|2f4c8f9f-2c82-fe86-0053-7ec1a2ae4e83","appliesTo":"CLASS"},"targets":[{"selector":".section","originalId":"68dc2b9d31cb83ac9f84a1fc|2f4c8f9f-2c82-fe86-0053-7ec1a2ae4e83","appliesTo":"CLASS"}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":30,"scrollOffsetUnit":"%","delay":null,"direction":null,"effectIn":null},"createdOn":1759933667428},"e-253":{"id":"e-253","name":"","animationType":"custom","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-4","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-254"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"68dc2b9d31cb83ac9f84a1fc|eef5bf69-af9a-1b7a-dcc9-7c571d84391a","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"68dc2b9d31cb83ac9f84a1fc|eef5bf69-af9a-1b7a-dcc9-7c571d84391a","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":0,"scrollOffsetUnit":"%","delay":null,"direction":null,"effectIn":null},"createdOn":1763656571797},"e-301":{"id":"e-301","name":"","animationType":"preset","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-4","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-302"}},"mediaQueries":["main","medium","small","tiny"],"target":{"id":"69d97fe66959a4a80b18e3d8|eef5bf69-af9a-1b7a-dcc9-7c571d84391a","appliesTo":"ELEMENT","styleBlockIds":[]},"targets":[{"id":"69d97fe66959a4a80b18e3d8|eef5bf69-af9a-1b7a-dcc9-7c571d84391a","appliesTo":"ELEMENT","styleBlockIds":[]}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":0,"scrollOffsetUnit":"%","delay":null,"direction":null,"effectIn":null},"createdOn":1775861732865},"e-307":{"id":"e-307","name":"","animationType":"preset","eventTypeId":"SCROLL_INTO_VIEW","action":{"id":"","actionTypeId":"GENERAL_START_ACTION","config":{"delay":0,"easing":"","duration":0,"actionListId":"a-146","affectedElements":{},"playInReverse":false,"autoStopEventId":"e-308"}},"mediaQueries":["main","medium","small","tiny"],"target":{"selector":".footer","originalId":"69d97fe66959a4a80b18e3d8|2f4c8f9f-2c82-fe86-0053-7ec1a2ae4f03","appliesTo":"CLASS"},"targets":[{"selector":".footer","originalId":"69d97fe66959a4a80b18e3d8|2f4c8f9f-2c82-fe86-0053-7ec1a2ae4f03","appliesTo":"CLASS"}],"config":{"loop":false,"playInReverse":false,"scrollOffsetValue":0,"scrollOffsetUnit":"%","delay":null,"direction":null,"effectIn":null},"createdOn":1775863734651}},"actionLists":{"a-4":{"id":"a-4","title":"Load - Intro Section","actionItemGroups":[{"actionItems":[{"id":"a-4-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"selector":".intro-display-block","selectorGuids":["b5a95984-dde2-509a-0e55-401fdb9056c7"]},"yValue":110,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-4","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc946d"},"value":0,"unit":""}},{"id":"a-4-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc946d"},"yValue":30,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-8","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"selector":".divider-filler---intro","selectorGuids":["da7f05a2-c1e6-a28d-cb98-22e8237b254b"]},"xValue":-100,"xUnit":"%","yUnit":"PX","zUnit":"PX"}},{"id":"a-4-n-9","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc947b"},"value":0,"unit":""}},{"id":"a-4-n-10","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc947b"},"yValue":60,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-13","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc9477"},"value":0,"unit":""}},{"id":"a-4-n-14","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc9477"},"yValue":60,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-17","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"selector":".intro-image-container","selectorGuids":["ff195754-62c0-4382-1575-6c3926d10010"]},"value":0,"unit":""}},{"id":"a-4-n-18","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"selector":".intro-image-container","selectorGuids":["ff195754-62c0-4382-1575-6c3926d10010"]},"yValue":30,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-21","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"selector":".work-service","selectorGuids":["a39a6fbc-3ff8-d01a-08c7-4f1270d3609a"]},"value":0,"unit":""}},{"id":"a-4-n-22","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"selector":".work-service","selectorGuids":["a39a6fbc-3ff8-d01a-08c7-4f1270d3609a"]},"yValue":60,"xUnit":"PX","yUnit":"%","zUnit":"PX"}}]},{"actionItems":[{"id":"a-4-n-2","actionTypeId":"TRANSFORM_MOVE","config":{"delay":2300,"easing":"outExpo","duration":1000,"target":{"selector":".intro-display-block","selectorGuids":["b5a95984-dde2-509a-0e55-401fdb9056c7"]},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-7","actionTypeId":"TRANSFORM_MOVE","config":{"delay":2300,"easing":"easeInOut","duration":1500,"target":{"selector":".divider-filler---intro","selectorGuids":["da7f05a2-c1e6-a28d-cb98-22e8237b254b"]},"xValue":0,"xUnit":"%","yUnit":"PX","zUnit":"PX"}},{"id":"a-4-n-5","actionTypeId":"STYLE_OPACITY","config":{"delay":2300,"easing":"easeInOut","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc946d"},"value":1,"unit":""}},{"id":"a-4-n-6","actionTypeId":"TRANSFORM_MOVE","config":{"delay":2300,"easing":"outExpo","duration":1000,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc946d"},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-11","actionTypeId":"STYLE_OPACITY","config":{"delay":2300,"easing":"easeInOut","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc947b"},"value":1,"unit":""}},{"id":"a-4-n-12","actionTypeId":"TRANSFORM_MOVE","config":{"delay":2300,"easing":"outExpo","duration":1000,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc947b"},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-15","actionTypeId":"STYLE_OPACITY","config":{"delay":2300,"easing":"easeInOut","duration":500,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc9477"},"value":1,"unit":""}},{"id":"a-4-n-16","actionTypeId":"TRANSFORM_MOVE","config":{"delay":2300,"easing":"outExpo","duration":1000,"target":{"id":"1c3068db-c85b-0976-fc44-419e0ecc9477"},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-19","actionTypeId":"STYLE_OPACITY","config":{"delay":2300,"easing":"easeInOut","duration":500,"target":{"selector":".intro-image-container","selectorGuids":["ff195754-62c0-4382-1575-6c3926d10010"]},"value":1,"unit":""}},{"id":"a-4-n-20","actionTypeId":"TRANSFORM_MOVE","config":{"delay":2300,"easing":"outExpo","duration":1000,"target":{"selector":".intro-image-container","selectorGuids":["ff195754-62c0-4382-1575-6c3926d10010"]},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-4-n-23","actionTypeId":"STYLE_OPACITY","config":{"delay":2300,"easing":"easeInOut","duration":500,"target":{"selector":".work-service","selectorGuids":["a39a6fbc-3ff8-d01a-08c7-4f1270d3609a"]},"value":1,"unit":""}},{"id":"a-4-n-24","actionTypeId":"TRANSFORM_MOVE","config":{"delay":2300,"easing":"outExpo","duration":1000,"target":{"selector":".work-service","selectorGuids":["a39a6fbc-3ff8-d01a-08c7-4f1270d3609a"]},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1713400303529},"a-16":{"id":"a-16","title":"Load - Page Section","actionItemGroups":[{"actionItems":[{"id":"a-16-n-4","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".divider-filler","selectorGuids":["4a5debe5-4573-de65-0ebf-de852128c36a"]},"xValue":-100,"xUnit":"%","yUnit":"PX","zUnit":"PX"}},{"id":"a-16-n-19","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"value":0,"unit":""}},{"id":"a-16-n-20","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"yValue":25,"xUnit":"PX","yUnit":"%","zUnit":"PX"}}]},{"actionItems":[{"id":"a-16-n-21","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"easeInOut","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"value":1,"unit":""}},{"id":"a-16-n-22","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"outExpo","duration":800,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-16-n-12","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"easeInOut","duration":1500,"target":{"useEventTarget":"CHILDREN","selector":".divider-filler","selectorGuids":["4a5debe5-4573-de65-0ebf-de852128c36a"]},"xValue":0,"xUnit":"%","yUnit":"PX","zUnit":"PX"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1713400303529},"a-34":{"id":"a-34","title":"Load - Page Section 2","actionItemGroups":[{"actionItems":[{"id":"a-34-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".divider-filler","selectorGuids":["4a5debe5-4573-de65-0ebf-de852128c36a"]},"xValue":-100,"xUnit":"%","yUnit":"PX","zUnit":"PX"}},{"id":"a-34-n-2","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"value":0,"unit":""}},{"id":"a-34-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"yValue":25,"xUnit":"PX","yUnit":"%","zUnit":"PX"}}]},{"actionItems":[{"id":"a-34-n-4","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"easeInOut","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"value":1,"unit":""}},{"id":"a-34-n-5","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"outExpo","duration":800,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-34-n-6","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"easeInOut","duration":1500,"target":{"useEventTarget":"CHILDREN","selector":".divider-filler","selectorGuids":["4a5debe5-4573-de65-0ebf-de852128c36a"]},"xValue":0,"xUnit":"%","yUnit":"PX","zUnit":"PX"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1713400303529},"a-45":{"id":"a-45","title":"Load - Page Section 3","actionItemGroups":[{"actionItems":[{"id":"a-45-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".divider-filler","selectorGuids":["4a5debe5-4573-de65-0ebf-de852128c36a"]},"xValue":-100,"xUnit":"%","yUnit":"PX","zUnit":"PX"}},{"id":"a-45-n-2","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"value":0,"unit":""}},{"id":"a-45-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"yValue":25,"xUnit":"PX","yUnit":"%","zUnit":"PX"}}]},{"actionItems":[{"id":"a-45-n-4","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"easeInOut","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"value":1,"unit":""}},{"id":"a-45-n-5","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"outExpo","duration":800,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-45-n-6","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"easeInOut","duration":1500,"target":{"useEventTarget":"CHILDREN","selector":".divider-filler","selectorGuids":["4a5debe5-4573-de65-0ebf-de852128c36a"]},"xValue":0,"xUnit":"%","yUnit":"PX","zUnit":"PX"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1713400303529},"a-146":{"id":"a-146","title":"Load - Page Section 4","actionItemGroups":[{"actionItems":[{"id":"a-146-n","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".divider-filler","selectorGuids":["4a5debe5-4573-de65-0ebf-de852128c36a"]},"xValue":-100,"xUnit":"%","yUnit":"PX","zUnit":"PX"}},{"id":"a-146-n-2","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"value":0,"unit":""}},{"id":"a-146-n-3","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"yValue":25,"xUnit":"PX","yUnit":"%","zUnit":"PX"}}]},{"actionItems":[{"id":"a-146-n-4","actionTypeId":"STYLE_OPACITY","config":{"delay":0,"easing":"easeInOut","duration":500,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"value":1,"unit":""}},{"id":"a-146-n-5","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"outExpo","duration":800,"target":{"useEventTarget":"CHILDREN","selector":".grid","selectorGuids":["3c162873-10e3-21c3-05f5-a6ca10193c7a"]},"yValue":0,"xUnit":"PX","yUnit":"%","zUnit":"PX"}},{"id":"a-146-n-6","actionTypeId":"TRANSFORM_MOVE","config":{"delay":0,"easing":"easeInOut","duration":1500,"target":{"useEventTarget":"CHILDREN","selector":".divider-filler","selectorGuids":["4a5debe5-4573-de65-0ebf-de852128c36a"]},"xValue":0,"xUnit":"%","yUnit":"PX","zUnit":"PX"}}]}],"useFirstGroupAsInitialState":true,"createdOn":1713400303529}},"site":{"mediaQueries":[{"key":"main","min":992,"max":10000},{"key":"medium","min":768,"max":991},{"key":"small","min":480,"max":767},{"key":"tiny","min":0,"max":479}]}}'
);

export function ContactFormCta(
    {
        as: _Component = Section,
        text1 = "",
        text2 = <>{"Möchstest du auch herausfinden Wie wir deine Marke helfen können?"}<br /><br />{"Wir beraten Dir Kostenlos!"}<br />{"‍"}</>
    }
) {
    _interactions.useInteractions(_interactionsData);

    return (
        <div
            className={DEVLINK_SCOPE_CLASS}
            style={{
                display: "contents"
            }}><_Component
                className="section---intro"
                grid={{
                    type: "section"
                }}
                tag="section"><Block className="container top-margin---medium-space custom" tag="div"><Grid className="grid" tag="div"><Block
                            className="divider top-margin---small-space"
                            id="w-node-c161e1af-905a-b145-b95e-832d2a54f8de-2a54f8db"
                            tag="div"><Block className="divider-filler---intro" tag="div" /></Block><Block
                            className="section-title"
                            id="w-node-c161e1af-905a-b145-b95e-832d2a54f8e0-2a54f8db"
                            tag="div"><Block className="dot-decoration" tag="div" /><Block tag="div">{text1}</Block></Block><Paragraph
                            className="text---paragraph"
                            id="w-node-c161e1af-905a-b145-b95e-832d2a54f8e5-2a54f8db">{text2}</Paragraph></Grid></Block><Block className="rl-padding-global-9" tag="div"><Block className="rl-container-large-8" tag="div"><Block className="rl-padding-section-large-7" tag="div"><FormWrapper
                                className="rl_contact6_form-block"
                                id="w-node-c161e1af-905a-b145-b95e-832d2a54f8ef-2a54f8db"><FormForm
                                    className="rl_contact6_form"
                                    data-name="PROJECTS M&CO KONTAKT"
                                    data-redirect="/brand-framework"
                                    id="wf-form-PROJECTS-M-CO-KONTAKT"
                                    method="get"
                                    name="wf-form-PROJECTS-M-CO-KONTAKT"
                                    redirect="/brand-framework"><Block className="rl_contact6_form-field-2col" tag="div"><Block className="rl_contact6_form-field-wrapper" tag="div"><FormBlockLabel className="rl-field-label" htmlFor="first_name">{"Vorname"}</FormBlockLabel><FormTextInput
                                                autoFocus={false}
                                                className="rl-form-input-2"
                                                data-name="first_name"
                                                disabled={false}
                                                id="first_name"
                                                maxLength={256}
                                                name="first_name"
                                                required={true}
                                                type="text" /></Block><Block className="rl_contact6_form-field-wrapper" tag="div"><FormBlockLabel className="rl-field-label" htmlFor="last_name">{"Nachname"}</FormBlockLabel><FormTextInput
                                                autoFocus={false}
                                                className="rl-form-input-2"
                                                data-name="last_name"
                                                disabled={false}
                                                id="last_name"
                                                maxLength={256}
                                                name="last_name"
                                                required={true}
                                                type="text" /></Block></Block><Block className="rl_contact6_form-field-2col" tag="div"><Block className="rl_contact6_form-field-wrapper" tag="div"><FormBlockLabel className="rl-field-label" htmlFor="email">{"Email Adresse"}</FormBlockLabel><FormTextInput
                                                autoFocus={false}
                                                className="rl-form-input-2"
                                                data-name="email"
                                                disabled={false}
                                                id="email"
                                                maxLength={256}
                                                name="email"
                                                required={true}
                                                type="email" /></Block><Block className="rl_contact6_form-field-wrapper" tag="div"><FormBlockLabel className="rl-field-label" htmlFor="phone">{"Telefon Nummer"}</FormBlockLabel><FormTextInput
                                                autoFocus={false}
                                                className="rl-form-input-2"
                                                data-name="phone"
                                                disabled={false}
                                                id="phone"
                                                maxLength={256}
                                                name="phone"
                                                required={false}
                                                type="tel" /></Block></Block><Block className="rl_contact6_form-field-wrapper" tag="div"><Block className="rl_contact6_spacing-block-5" tag="div" /><FormBlockLabel className="rl-field-label" htmlFor="Contact-2-Select">{"Womit können wir Sie helfen?"}</FormBlockLabel><Block className="rl_contact6_spacing-block-6" tag="div" /><Grid className="rl-form-radio-2col" tag="div"><FormRadioWrapper
                                                className="rl-form-radio"
                                                id="w-node-c161e1af-905a-b145-b95e-832d2a54f90d-2a54f8db"><FormRadioInput
                                                    className="rl-form-radio-icon"
                                                    customClassName="w-form-formradioinput--inputType-custom"
                                                    data-name="inquiry_topic"
                                                    form={{
                                                        type: "radio-input",
                                                        name: "inquiry_topic"
                                                    }}
                                                    id="Branding-2"
                                                    inputType="custom"
                                                    name="inquiry_topic"
                                                    required={false}
                                                    type="radio"
                                                    value="Branding" /><FormInlineLabel className="rl-form-radio-label" htmlFor="Contact 6 Radio -8">{"Branding"}</FormInlineLabel></FormRadioWrapper><FormRadioWrapper className="rl-form-radio"><FormRadioInput
                                                    className="rl-form-radio-icon"
                                                    customClassName="w-form-formradioinput--inputType-custom"
                                                    data-name="inquiry_topic"
                                                    form={{
                                                        type: "radio-input",
                                                        name: "inquiry_topic"
                                                    }}
                                                    id="Web-Design-Web-Development"
                                                    inputType="custom"
                                                    name="inquiry_topic"
                                                    required={false}
                                                    type="radio"
                                                    value="Web Design / Web Development" /><FormInlineLabel className="rl-form-radio-label" htmlFor="Contact 6 Radio -8">{"Web Design / Web Dev"}</FormInlineLabel></FormRadioWrapper><FormRadioWrapper className="rl-form-radio"><FormRadioInput
                                                    className="rl-form-radio-icon"
                                                    customClassName="w-form-formradioinput--inputType-custom"
                                                    data-name="inquiry_topic"
                                                    form={{
                                                        type: "radio-input",
                                                        name: "inquiry_topic"
                                                    }}
                                                    id="App-Design-App-Development"
                                                    inputType="custom"
                                                    name="inquiry_topic"
                                                    required={false}
                                                    type="radio"
                                                    value="App Design / App Development" /><FormInlineLabel className="rl-form-radio-label" htmlFor="Contact 6 Radio -8">{"App Design / App Dev"}</FormInlineLabel></FormRadioWrapper><FormRadioWrapper
                                                className="rl-form-radio"
                                                id="w-node-c161e1af-905a-b145-b95e-832d2a54f919-2a54f8db"><FormRadioInput
                                                    className="rl-form-radio-icon"
                                                    customClassName="w-form-formradioinput--inputType-custom"
                                                    data-name="inquiry_topic"
                                                    form={{
                                                        type: "radio-input",
                                                        name: "inquiry_topic"
                                                    }}
                                                    id="Social-Media"
                                                    inputType="custom"
                                                    name="inquiry_topic"
                                                    required={false}
                                                    type="radio"
                                                    value="Social Media" /><FormInlineLabel className="rl-form-radio-label" htmlFor="Contact 6 Radio -8">{"Social Media"}</FormInlineLabel></FormRadioWrapper><FormRadioWrapper
                                                className="rl-form-radio"
                                                id="w-node-c161e1af-905a-b145-b95e-832d2a54f91d-2a54f8db"><FormRadioInput
                                                    className="rl-form-radio-icon"
                                                    customClassName="w-form-formradioinput--inputType-custom"
                                                    data-name="inquiry_topic"
                                                    form={{
                                                        type: "radio-input",
                                                        name: "inquiry_topic"
                                                    }}
                                                    id="Workflow-Automations"
                                                    inputType="custom"
                                                    name="inquiry_topic"
                                                    required={false}
                                                    type="radio"
                                                    value="Workflow Automations" /><FormInlineLabel className="rl-form-radio-label" htmlFor="Contact 6 Radio -8">{"Workflow Automations"}</FormInlineLabel></FormRadioWrapper><FormRadioWrapper
                                                className="rl-form-radio"
                                                id="w-node-c161e1af-905a-b145-b95e-832d2a54f921-2a54f8db"><FormRadioInput
                                                    className="rl-form-radio-icon"
                                                    customClassName="w-form-formradioinput--inputType-custom"
                                                    data-name="inquiry_topic"
                                                    form={{
                                                        type: "radio-input",
                                                        name: "inquiry_topic"
                                                    }}
                                                    id="Advertisement"
                                                    inputType="custom"
                                                    name="inquiry_topic"
                                                    required={false}
                                                    type="radio"
                                                    value="Advertisement" /><FormInlineLabel className="rl-form-radio-label" htmlFor="Contact 6 Radio -8">{"Advertisement"}</FormInlineLabel></FormRadioWrapper><FormRadioWrapper
                                                className="rl-form-radio"
                                                id="w-node-c161e1af-905a-b145-b95e-832d2a54f925-2a54f8db"><FormRadioInput
                                                    className="rl-form-radio-icon"
                                                    customClassName="w-form-formradioinput--inputType-custom"
                                                    data-name="inquiry_topic"
                                                    form={{
                                                        type: "radio-input",
                                                        name: "inquiry_topic"
                                                    }}
                                                    id="Weiteres"
                                                    inputType="custom"
                                                    name="inquiry_topic"
                                                    required={false}
                                                    type="radio"
                                                    value="Weiteres" /><FormInlineLabel className="rl-form-radio-label" htmlFor="Contact 6 Radio -8">{"Weiteres"}</FormInlineLabel></FormRadioWrapper></Grid><Block className="rl_contact6_spacing-block-5" tag="div" /></Block><Block className="rl_contact6_form-field-wrapper" tag="div"><FormBlockLabel className="rl-field-label" htmlFor="message">{"Ihre Nachricht"}</FormBlockLabel><FormTextarea
                                            autoFocus={false}
                                            className="rl-form-text-area"
                                            data-name="message"
                                            id="message"
                                            maxLength={5000}
                                            name="message"
                                            placeholder="Hier eingeben."
                                            required={true} /></Block><FormCheckboxWrapper
                                        className="rl-form-checkbox w-node-c161e1af-905a-b145-b95e-832d2a54f92e-2a54f8db"
                                        id="Contact-6-Checkbox"><FormCheckboxInput
                                            checked={true}
                                            className="rl-form-checkbox-icon"
                                            customClassName="w-checkbox-input--inputType-custom"
                                            data-name="privacy_consent, email_marketing_consent"
                                            form={{
                                                type: "checkbox-input",
                                                name: "privacy_consent, email_marketing_consent"
                                            }}
                                            id="privacy_consent-email_marketing_consent"
                                            inputType="custom"
                                            name="privacy_consent-email_marketing_consent"
                                            required={true}
                                            type="checkbox" /><FormInlineLabel className="rl-checkbox-label-small" htmlFor="Contact 6 Checkbox-2">{"Ich akzeptiere die "}<Link
                                                block=""
                                                button={false}
                                                className="link-9"
                                                options={{
                                                    href: "#"
                                                }}>{"Datenschutzerklärung"}</Link>{" und "}<Link
                                                block=""
                                                button={false}
                                                className="link-10"
                                                options={{
                                                    href: "#"
                                                }}>{"AGB"}</Link>{" und erlaube Miraka & Co. Intl. mir gelegentlich E-Mails zu Projekten, Geschäftsberichten und Angeboten zu senden. Keine Werbung, kein Spam. Abmeldung jederzeit möglich."}</FormInlineLabel></FormCheckboxWrapper><Block
                                        className="rl_contact6_button-wrapper"
                                        id="w-node-c161e1af-905a-b145-b95e-832d2a54f938-2a54f8db"
                                        tag="div"><Block className="rl_contact6_spacing-block-7" tag="div" /><FormButton
                                            className="rl-button-5"
                                            data-wait="Bitte warten..."
                                            id="w-node-c161e1af-905a-b145-b95e-832d2a54f93a-2a54f8db"
                                            type="submit"
                                            value="Anfragen" /></Block></FormForm><FormSuccessMessage className="rl-success-message-2"><Block className="rl-success-text-2" tag="div">{"Danke! Wir haben Ihre Anfrage erhalten und melden uns bald möglichst bei Ihnen. Bei dringende anfragen schreiben Sie uns eine email auf "}<Link
                                            block=""
                                            button={false}
                                            options={{
                                                href: "#"
                                            }}><Span className="text-span-62">{"office@miraka.ch"}</Span></Link><br /><br />{"In die Zwischenzeit schauen Sie in Ihre email postfach. Wir haben was für Sie!"}<br /><br />{"Ihr Miraka & Co. Team"}</Block></FormSuccessMessage><FormErrorMessage className="rl-error-message-2"><Block className="rl-error-text-2" tag="div">{"Etwas ist Schiefgelaufen. Bitte versuchen Sie es später noch einmal."}</Block></FormErrorMessage></FormWrapper></Block></Block></Block></_Component></div>
    );
}