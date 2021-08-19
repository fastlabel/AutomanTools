import { OrbitControls as DreiOrbitControls } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import React, { createRef, FC, useEffect } from "react";
import { Vector3 } from "three";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { AnnotationClassVO } from "../../types/vo";
import FLAnnotationControls, { FLAnnotationControlsImpl } from "./fl-annotation-controls";

type Props = {
    position0?: Vector3;
    preObject?: AnnotationClassVO;
    onPutObject?: (evt: ThreeEvent<MouseEvent>, preObject: AnnotationClassVO) => void;
};

const FLMainControls: FC<Props> = ({ position0, preObject, onPutObject = f => f }) => {
    const orbit = createRef<OrbitControlsImpl>();
    const annotation = createRef<FLAnnotationControlsImpl>();

    // TODO adjust  position only first time

    useEffect(() => {
        const putMode = !!preObject;

        if (annotation.current) {
            annotation.current.enabled = putMode;
        }

    }, [annotation]);

    useEffect(() => {
        if (position0 && orbit.current && orbit.current.enabled) {
            const control = orbit.current;
            control.object.position.copy(position0.clone().setY(position0.y + 15));
            control.target.copy(position0);
            control.saveState();
        }
    }, []);

    return (
        <>
            <FLAnnotationControls ref={annotation} preObject={preObject} onPutObject={onPutObject} />
            <DreiOrbitControls ref={orbit} enableDamping={false} />
        </>
    );
};

export default FLMainControls;