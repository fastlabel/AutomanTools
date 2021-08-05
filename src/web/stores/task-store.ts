import { useState } from "react";
import { createContainer } from "unstated-next";
import { ContentRootVO } from "../types/vo";

const useTask = () => {
    const [contentRootVO, setContentRootVO] = useState<ContentRootVO>();
    const fetch = (contentRootId: string) => {

    }
    return {
        contentRootVO
    };
}

export default createContainer(useTask);