import * as React from "react";
import * as Types from "./types";

declare function TempBlog(
    props: {
        as?: React.ElementType;
        originalLink?: Types.Basic.Link;
        linkedinArticle?: Types.Basic.Link;
        twitterPostLink?: Types.Basic.Link;
        facebookPostLink?: Types.Basic.Link;
        slug?: React.ReactNode;
        name?: React.ReactNode;
        articleOwnerNme?: React.ReactNode;
        articleDate?: React.ReactNode;
        mainImage?: Types.Asset.Image;
        auhorName?: React.ReactNode;
        creditsTextFullLength?: React.ReactNode;
    }
): React.JSX.Element