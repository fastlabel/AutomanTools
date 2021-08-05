import { useState } from "react";
import { createContainer } from "unstated-next";
import { ContentFrameVO, ContentRootVO } from "../types/vo";

const useTaskResource = () => {
    const [contentRootVO, setContentRootVO] = useState<ContentRootVO>();
    const [contentFrameVO, setContentFrameVO] = useState<ContentFrameVO>();

    const fetchRoot = (contentRootId: string) => {

    };

    const fetchFrame = (frameNo: string) => {

    };

    return {
        contentRootVO,
        contentFrameVO
    };
}

export default createContainer(useTaskResource);