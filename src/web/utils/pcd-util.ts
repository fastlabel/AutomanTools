
// from https://gitlab.com/taketwo/three-pcd-loader/blob/master/decompress-lzf.js
const decompressLZF = (inData: any, outLength: number): Uint8Array => {
    const inLength = inData.length;
    const outData = new Uint8Array(outLength);
    let inPtr = 0;
    let outPtr = 0;
    let ctrl;
    let len;
    let ref;
    do {

        ctrl = inData[inPtr++];
        if (ctrl < (1 << 5)) {

            ctrl++;
            if (outPtr + ctrl > outLength) throw new Error('Output buffer is not large enough');
            if (inPtr + ctrl > inLength) throw new Error('Invalid compressed data');
            do {

                outData[outPtr++] = inData[inPtr++];

            } while (--ctrl);

        } else {

            len = ctrl >> 5;
            ref = outPtr - ((ctrl & 0x1f) << 8) - 1;
            if (inPtr >= inLength) throw new Error('Invalid compressed data');
            if (len === 7) {

                len += inData[inPtr++];
                if (inPtr >= inLength) throw new Error('Invalid compressed data');

            }

            ref -= inData[inPtr++];
            if (outPtr + len + 2 > outLength) throw new Error('Output buffer is not large enough');
            if (ref < 0) throw new Error('Invalid compressed data');
            if (ref >= outPtr) throw new Error('Invalid compressed data');
            do {

                outData[outPtr++] = outData[ref++];

            } while (--len + 2);

        }

    } while (inPtr < inLength);

    return outData;
}

const parseHeader = (data: any) => {
    const header: any = {};
    const result1 = data.search(/[\r\n]DATA\s(\S*)\s/i);
    const result2 = /[\r\n]DATA\s(\S*)\s/i.exec(data.substr(result1 - 1)) || [];

    header.data = result2[1];
    header.headerLen = result2[0].length + result1;
    header.str = data.substr(0, header.headerLen);

    // remove comments

    header.str = header.str.replace(/#.*/gi, '');

    // parse

    header.version = /VERSION (.*)/i.exec(header.str);
    header.fields = /FIELDS (.*)/i.exec(header.str);
    header.size = /SIZE (.*)/i.exec(header.str);
    header.type = /TYPE (.*)/i.exec(header.str);
    header.count = /COUNT (.*)/i.exec(header.str);
    header.width = /WIDTH (.*)/i.exec(header.str);
    header.height = /HEIGHT (.*)/i.exec(header.str);
    header.viewpoint = /VIEWPOINT (.*)/i.exec(header.str);
    header.points = /POINTS (.*)/i.exec(header.str);

    // evaluate

    if (header.version !== null) {
        header.version = parseFloat(header.version[1]);
    }
    if (header.fields !== null) {
        header.fields = header.fields[1].split(' ');
    }
    if (header.type !== null) {
        header.type = header.type[1].split(' ');
    }
    if (header.width !== null) {
        header.width = parseInt(header.width[1]);
    }
    if (header.height !== null) {
        header.height = parseInt(header.height[1]);
    }
    if (header.viewpoint !== null) {
        header.viewpoint = header.viewpoint[1];
    }
    if (header.points !== null) {
        header.points = parseInt(header.points[1], 10);
    }
    if (header.points === null) {
        header.points = header.width * header.height;
    }
    if (header.size !== null) {
        header.size = header.size[1].split(' ').map((x: any) => {
            return parseInt(x, 10);
        });
    }
    if (header.count !== null) {
        header.count = header.count[1].split(' ').map((x: any) => {
            return parseInt(x, 10);
        });
    } else {
        header.count = [];
        for (let i = 0, l = header.fields.length; i < l; i++) {
            header.count.push(1);
        }
    }
    header.offset = {};
    let sizeSum = 0;
    for (let i = 0, l = header.fields.length; i < l; i++) {
        if (header.data === 'ascii') {
            header.offset[header.fields[i]] = i;
        } else {
            header.offset[header.fields[i]] = sizeSum;
            sizeSum += header.size[i] * header.count[i];
        }
    }
    // for binary only
    header.rowSize = sizeSum;
    return header;
}

const PcdUtil = {

    parse(data: any, textData: string, url: string, argLittleEndian?: boolean) {
        const littleEndian = argLittleEndian === undefined ? true : argLittleEndian;
        // parse header (always ascii format)
        const header = parseHeader(textData);

        // parse data
        const position = [];
        const normal = [];
        const color = [];

        // ascii
        if (header.data === 'ascii') {
            const offset = header.offset;
            const pcdData = textData.substr(header.headerLen);
            const lines = pcdData.split('\n');
            for (let i = 0, l = lines.length; i < l; i++) {
                if (lines[i] === '') continue;
                const line = lines[i].split(' ');
                if (offset.x !== undefined) {
                    position.push(parseFloat(line[offset.x]));
                    position.push(parseFloat(line[offset.y]));
                    position.push(parseFloat(line[offset.z]));
                }
                if (offset.rgb !== undefined) {
                    const rgb = parseFloat(line[offset.rgb]);
                    const r = (rgb >> 16) & 0x0000ff;
                    const g = (rgb >> 8) & 0x0000ff;
                    const b = (rgb >> 0) & 0x0000ff;
                    color.push(r / 255, g / 255, b / 255);
                }
                if (offset.normal_x !== undefined) {
                    normal.push(parseFloat(line[offset.normal_x]));
                    normal.push(parseFloat(line[offset.normal_y]));
                    normal.push(parseFloat(line[offset.normal_z]));
                }
            }
        }
        // binary-compressed

        // normally data in PCD files are organized as array of structures: XYZRGBXYZRGB
        // binary compressed PCD files organize their data as structure of arrays: XXYYZZRGBRGB
        // that requires a totally different parsing approach compared to non-compressed data
        if (header.data === 'binary_compressed') {
            const sizes = new Uint32Array(data.slice(header.headerLen, header.headerLen + 8));
            const compressedSize = sizes[0];
            const decompressedSize = sizes[1];
            const decompressed = decompressLZF(new Uint8Array(data, header.headerLen + 8, compressedSize), decompressedSize);
            const dataview = new DataView(decompressed.buffer);
            const offset = header.offset;
            for (let i = 0; i < header.points; i++) {
                if (offset.x !== undefined) {
                    position.push(dataview.getFloat32((header.points * offset.x) + header.size[0] * i, littleEndian));
                    position.push(dataview.getFloat32((header.points * offset.y) + header.size[1] * i, littleEndian));
                    position.push(dataview.getFloat32((header.points * offset.z) + header.size[2] * i, littleEndian));
                }
                if (offset.rgb !== undefined) {
                    color.push(dataview.getUint8((header.points * offset.rgb) + header.size[3] * i + 0) / 255.0);
                    color.push(dataview.getUint8((header.points * offset.rgb) + header.size[3] * i + 1) / 255.0);
                    color.push(dataview.getUint8((header.points * offset.rgb) + header.size[3] * i + 2) / 255.0);
                }
                if (offset.normal_x !== undefined) {
                    normal.push(dataview.getFloat32((header.points * offset.normal_x) + header.size[4] * i, littleEndian));
                    normal.push(dataview.getFloat32((header.points * offset.normal_y) + header.size[5] * i, littleEndian));
                    normal.push(dataview.getFloat32((header.points * offset.normal_z) + header.size[6] * i, littleEndian));
                }
            }
        }

        // binary
        if (header.data === 'binary') {
            const dataview = new DataView(data, header.headerLen);
            const offset = header.offset;
            for (let i = 0, row = 0; i < header.points; i++, row += header.rowSize) {
                if (offset.x !== undefined) {
                    position.push(dataview.getFloat32(row + offset.x, littleEndian));
                    position.push(dataview.getFloat32(row + offset.y, littleEndian));
                    position.push(dataview.getFloat32(row + offset.z, littleEndian));
                }
                if (offset.rgb !== undefined) {
                    color.push(dataview.getUint8(row + offset.rgb + 2) / 255.0);
                    color.push(dataview.getUint8(row + offset.rgb + 1) / 255.0);
                    color.push(dataview.getUint8(row + offset.rgb + 0) / 255.0);
                }
                if (offset.normal_x !== undefined) {
                    normal.push(dataview.getFloat32(row + offset.normal_x, littleEndian));
                    normal.push(dataview.getFloat32(row + offset.normal_y, littleEndian));
                    normal.push(dataview.getFloat32(row + offset.normal_z, littleEndian));
                }
            }
        }
        const urlConverted = /([^/]*)/.exec(url.split('').reverse().join('')) || [];
        const name = urlConverted[1].split('').reverse().join('');
        return { header, position, normal, color, name };
    },

    getMaxMin(vertices: number[] | Float32Array, target: 'x' | 'y' | 'z'): { max: number, min: number, points: number[] } {
        const stride = 3;
        let max = Number.NEGATIVE_INFINITY;
        let min = Number.POSITIVE_INFINITY;
        const points = [];
        const offset = target === 'z' ? 2 : target === 'y' ? 1 : 0;
        for (let i = 0, l = vertices.length / stride; i < l; i++) {
            const vertic = vertices[stride * i + offset];
            if (vertic > max) {
                max = vertic;
            }
            if (vertic < min) {
                min = vertic;
            }
            points.push(vertic);
        }
        return { max, min, points };
    }
};

export default PcdUtil;