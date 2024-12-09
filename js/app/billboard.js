"use strict";

class BillboardText extends Plane3D {
    constructor(gl, shader, text) {
        super(gl, shader);
        this.texture = createTextTexture(gl, text);
        this.setScale([0.5, 0.2, 1.0]);
        this.setPosition(0, 1.2, 0);
    }

    update(viewMatrix) {
        updateBillboard(this.model_matrix, viewMatrix);
    }
}
