import {
  BoxGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Euler,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OrthographicCamera,
  PlaneGeometry,
  Quaternion,
  Vector3,
} from 'three';

type _BaseGizItemSet = [
  base: any,
  position?: number[] | null,
  rotation?: number[] | null
];

type _Item = { gizmo: Object3D; picker: Object3D };

export type ControlKey =
  | 'T_BOX'
  | 'S_TL'
  | 'S_TR'
  | 'S_BL'
  | 'S_BR'
  | 'R_POINT';

export type ControlType = 'top' | 'side' | 'front';

const HALF_ANGLE = Math.PI / 2;

export class FLTransformControlsGizmo extends Object3D {
  public type = 'FLTransformControlsGizmo';

  private isTransformControlsGizmo = true;

  // these are set from parent class FLTransformControls

  private worldPosition = new Vector3();
  private worldQuaternion = new Quaternion();

  private camera: OrthographicCamera = null!;
  private enabled = true;
  private axis: string | null = null;

  private item: _Item | undefined;

  private object: Object3D | undefined;
  private control: ControlType;

  private positions: Map<ControlKey, Vector3> = new Map();

  constructor(control: ControlType) {
    super();
    this.control = control;
  }

  public attach = (object: Object3D): this => {
    if (this.object) {
      this.detach();
    }
    this._init(object);
    return this;
  };

  public detach = (): this => {
    this.clear();
    this.object = undefined;
    return this;
  };

  public getPicker = (): Object3D => {
    if (!this.item) throw new Error('not attached object');
    return this.item.picker;
  };

  // updateMatrixWorld will update transformations and appearance of individual handles
  public updateMatrixWorld = (): void => {
    if (!this.object || !this.item) return;

    if (!this.camera.isOrthographicCamera) {
      throw new Error('only supported OrthographicCamera!!');
    }
    // always local
    const quaternion = this.worldQuaternion;

    // temp
    const item = this.item;
    const object = this.object;

    // Show only gizmos for current transform mode
    let handles: Array<Object3D & { tag?: string }> = [];
    handles = handles.concat(item.gizmo.children);
    handles = handles.concat(item.picker.children);

    handles.forEach((handle) => {
      // hide aligned to camera
      handle.visible = true;
      handle.position.copy(this.worldPosition);
      // Align handles to current local or world rotation

      if (handle.name === 'T_BOX') {
        handle.scale.copy(object.scale);
        handle.quaternion.copy(quaternion);
      } else {
        const base = this.positions.get(handle.name as any)?.clone();
        if (base) {
          const v = base.clone();
          if (handle.name === 'R_POINT') {
            if (this.control === 'top') {
              v.multiply(object.scale.clone().setY(1));
            } else if (this.control === 'side') {
              v.multiply(object.scale.clone().setX(1));
              v.multiply(new Vector3(1, 1, -1));
              base.multiply(new Vector3(1, 1, -1));
            }
          } else {
            v.multiply(object.scale);
          }
          v.applyQuaternion(quaternion);
          const mesh = handle as Mesh;
          handle.position.add(v);

          const scale = 75 / this.camera.zoom;
          handle.scale.set(scale, scale, scale);
        }
      }

      // highlight selected axis
      const material = (handle as any).material;
      material.tempOpacity = material.tempOpacity || material.opacity;
      material.tempColor = material.tempColor || material.color.clone();
      material.color.copy(material.tempColor);
      material.opacity = material.tempOpacity;

      if (!this.enabled) {
        material.opacity *= 0.5;
        material.color.lerp(new Color(1, 1, 1), 0.5);
      } else if (this.axis) {
        if (handle.name === this.axis && this.axis !== 'T_BOX') {
          material.opacity = 1.0;
          material.color.lerp(new Color(1, 1, 1), 0.5);
        } else {
          material.opacity *= 0.25;
          material.color.lerp(new Color(1, 1, 1), 0.5);
        }
      }
    });
    super.updateMatrixWorld();
  };

  private _init = (object: Object3D): void => {
    this.object = object;

    // TODO move util
    const cube = object.children[1] as Mesh<BoxGeometry, MeshBasicMaterial>;

    const gizmoMaterial = new MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      transparent: true,
      side: DoubleSide,
      fog: false,
      toneMapped: false,
      color: cube.material.color,
    });

    const gizmoLineMaterial = new LineBasicMaterial({
      depthTest: false,
      depthWrite: false,
      transparent: true,
      linewidth: 1,
      fog: false,
      toneMapped: false,
    });

    // Make unique material for each axis/color

    const matInvisible = gizmoMaterial.clone();
    matInvisible.opacity = 0.15;

    const matHelper = gizmoMaterial.clone();
    matHelper.opacity = 0.33;

    const matWhiteTransparent = gizmoMaterial.clone() as MeshBasicMaterial;
    matWhiteTransparent.opacity = 0.25;

    // Gizmo definitions - custom hierarchy definitions for setupGizmo() function
    const _PlaneMeth = (
      control: ControlType,
      material: MeshBasicMaterial
    ): _BaseGizItemSet => {
      let mesh = null;
      const plane = new PlaneGeometry(1, 1);
      switch (control) {
        case 'top':
          // p.x, p.y
          mesh = new Mesh(plane, material);
          return [mesh, [0, 0, 0], [0, 0, 0]];
        case 'side':
          // p.y, p.z
          mesh = new Mesh(plane, material);
          return [mesh, [0, 0, 0], [HALF_ANGLE, 0, 0]];
        case 'front':
          // p.x, p.z
          mesh = new Mesh(plane, material);
          return [mesh, [0, 0, 0], [0, HALF_ANGLE, 0]];
      }
    };

    const _boxPoints = () => {
      const x = 0.5;
      const y = 0.5;
      const z = 0.5;

      /*
              5____4
            1/___0/|
            | 6__|_7
            2/___3/
    
             8 TOP rotation point
             9 SIDE rotation point 
            10 FRONT rotation point [unused now]
            */
      return [
        new Vector3(-x, y, z),
        new Vector3(-x, -y, z),
        new Vector3(-x, -y, -z),
        new Vector3(-x, y, -z),
        new Vector3(x, y, z),
        new Vector3(x, -y, z),
        new Vector3(x, -y, -z),
        new Vector3(x, y, -z),
        new Vector3(x + 0.3, 0, 0),
        new Vector3(0, 0, z + 0.3),
      ];
    };

    const _renderPoints = (
      control: ControlType,
      boxVertex: Vector3[]
    ): [
      points: [
        tl: Vector3,
        tr: Vector3,
        bl: Vector3,
        br: Vector3,
        rotate: Vector3 | undefined
      ],
      rotation: Euler | undefined
    ] => {
      switch (control) {
        // FRONT
        case 'top':
          return [
            [
              boxVertex[0].setZ(0),
              boxVertex[1].setZ(0),
              boxVertex[5].setZ(0),
              boxVertex[4].setZ(0),
              boxVertex[8].setZ(0),
            ],
            undefined,
          ];
        // SIDE
        case 'side':
          return [
            [
              boxVertex[1].setY(0),
              boxVertex[2].setY(0),
              boxVertex[5].setY(0),
              boxVertex[6].setY(0),
              boxVertex[9].setY(0),
            ],
            new Euler(HALF_ANGLE, 0, 0),
          ];
        // TOP
        case 'front':
          return [
            [
              boxVertex[0].setX(0),
              boxVertex[1].setX(0),
              boxVertex[2].setX(0),
              boxVertex[3].setX(0),
              undefined,
            ],
            new Euler(0, HALF_ANGLE, 0),
          ];
      }
    };

    const [points, rotation] = _renderPoints(this.control, _boxPoints());

    this.positions.set('S_TL', points[0].clone());
    this.positions.set('S_TR', points[1].clone());
    this.positions.set('S_BL', points[2].clone());
    this.positions.set('S_BR', points[3].clone());
    if (points[4]) {
      this.positions.set('R_POINT', points[4].clone());
    }

    const circleGeometry = new CircleGeometry(0.1, 32);
    const _PointMesh = (
      points: Vector3,
      rotation: Euler | undefined,
      material: MeshBasicMaterial
    ): _BaseGizItemSet => {
      const mesh = new Mesh(circleGeometry, material);
      return [
        mesh,
        points.toArray(),
        rotation ? rotation.toArray() : undefined,
      ];
    };

    const _gizom: { [name: string]: _BaseGizItemSet[] } = {
      T_BOX: [_PlaneMeth(this.control, matWhiteTransparent.clone())],
      S_TL: [_PointMesh(points[0], rotation, matWhiteTransparent.clone())],
      S_TR: [_PointMesh(points[1], rotation, matWhiteTransparent.clone())],
      S_BL: [_PointMesh(points[2], rotation, matWhiteTransparent.clone())],
      S_BR: [_PointMesh(points[3], rotation, matWhiteTransparent.clone())],
      R_POINT: points[4]
        ? [_PointMesh(points[4], rotation, matWhiteTransparent.clone())]
        : [],
    };

    const _picker: { [name: string]: _BaseGizItemSet[] } = {
      T_BOX: [_PlaneMeth(this.control, matInvisible)],
      S_TL: [_PointMesh(points[0], rotation, matInvisible)],
      S_TR: [_PointMesh(points[1], rotation, matInvisible)],
      S_BL: [_PointMesh(points[2], rotation, matInvisible)],
      S_BR: [_PointMesh(points[3], rotation, matInvisible)],
      R_POINT: points[4] ? [_PointMesh(points[4], rotation, matInvisible)] : [],
    };

    this.item = {
      gizmo: this._setupGizmo(_gizom, object.scale),
      picker: this._setupGizmo(_picker, object.scale),
    };
    this.add(this.item.gizmo);
    this.add(this.item.picker);
  };

  // Creates an Object3D with gizmos described in custom hierarchy definition.
  // this is nearly impossible to Type so i'm leaving it
  private _setupGizmo = (
    gizmoMap: { [name: string]: _BaseGizItemSet[] },
    scale: Vector3
  ): Object3D => {
    const gizmo = new Object3D();

    Object.keys(gizmoMap).forEach((name) => {
      gizmoMap[name].forEach((item) => {
        const [base, position, rotation] = item;
        const object = base.clone();
        // name and tag properties are essential for picking and updating logic.
        object.name = name;

        if (position) {
          object.position.set(position[0], position[1], position[2]);
        }
        if (rotation) {
          object.rotation.set(rotation[0], rotation[1], rotation[2]);
        }
        object.updateMatrix();
        if (object.geometry.type === 'PlaneGeometry') {
          const tempGeometry = object.geometry.clone();
          tempGeometry.applyMatrix4(object.matrix);
          object.geometry = tempGeometry;
          object.renderOrder = Infinity;
          object.position.set(0, 0, 0);
          object.rotation.set(0, 0, 0);
        }
        gizmo.add(object);
      });
    });
    return gizmo;
  };
}
