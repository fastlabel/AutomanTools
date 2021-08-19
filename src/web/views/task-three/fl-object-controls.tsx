import { useThree } from "@react-three/fiber";
import React, { FC, useEffect, useState } from "react";
import { Object3D } from "three";
import { FLTransformControls } from "./fl-transform-controls";
import { ControlType } from "./fl-transform-controls-gizmo";

const FLObjectControls: FC<{ control: ControlType, target?: Object3D }> = ({ control, target }) => {
    const { gl, camera } = useThree();
    const [controls] = useState(() => new FLTransformControls(camera, gl.domElement, control));

    useEffect(() => {
        if (target) {
            controls.attach(target);
        }
    }, [controls, target]);

    return controls ? (
        <>
            <primitive dispose={undefined} object={controls} />
        </>
    ) : null;
};

export default FLObjectControls;