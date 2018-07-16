function is_touch_device() {
  return 'ontouchstart' in window        // works on most browsers 
      || navigator.maxTouchPoints;       // works on IE10/11 and Surface
};


function GlRenderer(canvas, maxVertexCnt, isImg, imgPath, videoElement) {

    console.log("cuenado?",maxVertexCnt);

    this.canvas = canvas;
    this.maxVertexCnt = maxVertexCnt;
    this.isImg = isImg;
    var callback = videoElement;

    this.init();

    this.updateImage(imgPath, callback);

    this.hasWireframe = false;

    // window.renderer = this;
};



GlRenderer.prototype.init = function() {
    this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true
    });
    this.renderer.setClearColor(0x0);

    this.scene = new THREE.Scene();
    this.finalScene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera(-this.canvas.width / 2,
            this.canvas.width / 2, this.canvas.height / 2,
            -this.canvas.height / 2, 0, 10);
    this.camera.position.set(0, 0, 10);
    this.scene.add(this.camera);
    this.finalScene.add(this.camera);


    this.AmbientLight = new THREE.AmbientLight( 0xffffff, 0.9);
    this.finalScene.add(( this.AmbientLight ));

    var menor_longitud = this.canvas.height;
    if(this.canvas.width < this.canvas.height){
        menor_longitud = this.canvas.width;
    }
    var radio_luz = menor_longitud/4;

    this.light1 = new THREE.PointLight( 0xffffff, 1.1, radio_luz );
    this.light1.position.set( -100, 170, 30 );
    this.finalScene.add( this.light1 );



    var renderPass = new THREE.RenderPass(this.scene, this.camera);

    var edgeShader = new THREE.ShaderPass(THREE.EdgeShader);

    var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
    effectCopy.renderToScreen = true;

    this.composer = new THREE.EffectComposer(this.renderer);
    this.composer.addPass(renderPass);
    this.composer.addPass(edgeShader);
    this.composer.addPass(effectCopy);

    // material for vertex wireframe
    this.wireframeMaterial = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xffff00
    });
    this.wireframeMesh = null;

    // material for face color
    this.faceMaterial = new THREE.MeshLambertMaterial({
        vertexColors: THREE.FaceColors,
        color: 0xffffff
    });
    this.faceMesh = null;


    this.principio = 0;
    this.final = 100;



};



// set maximum vertex cnt
GlRenderer.prototype.setVertexCnt = function(cnt) {
    this.maxVertexCnt = cnt;
};



// returns bool state of if (x, y) is selected to form triangle
GlRenderer.prototype._isLastSelected = function(x, y) {
    var ys = this.lastSelected[x];
    if (ys) {
        for (var i = ys.length - 1; i >= 0; --i) {
            if (ys[i] == y) {
                return true;
            }
        }
    }
    return false;
};

// push to thisSelected array, won't check if has already added
GlRenderer.prototype._setThisSelected = function(x, y) {
    var ys = this.thisSelected[x];
    if (ys) {
        ys.push(y);
    } else {
        this.thisSelected[x] = [y];
    }
};



// display and hide wireframe
GlRenderer.prototype.setWireframe = function(hasWireframe) {
    if (this.wireframeMesh) {
        this.wireframeMesh.visible = hasWireframe;
        if (this.hasWireframe != hasWireframe) {
            this.renderer.render(this.finalScene, this.camera);
            this.hasWireframe = hasWireframe;
        }
    }
};



// change to a new image
GlRenderer.prototype.updateImage = function(imgPath, callback) {
    this.imgPath = imgPath;
    this._renderSize = null;
    this.clear();
    if (this.imgMesh) {
        this.scene.remove(this.imgMesh);
        this.imgMesh = null;
    }

    // render the srcImg to get pixel color later
    this.preRender(callback);
};



// remove objects from the scene
GlRenderer.prototype.clear = function() {
    // remove meshes from scene
    if (this.faceMesh) {
        this.finalScene.remove(this.faceMesh);
        this.faceMesh = null;
    }
    if (this.wireframeMesh) {
        this.finalScene.remove(this.wireframeMesh);
        this.wireframeMesh = null;
    }
};


// render again without changing triangle positions
GlRenderer.prototype.render = function(callback) {




    this.clear();

    var size = this.getRenderSize();

    // plane for render target
    var that = this;
    
    // image
    var srcTexture = THREE.ImageUtils.loadTexture(this.imgPath, {}, process);
    srcTexture.magFilter = THREE.LinearFilter;
    srcTexture.minFilter = THREE.LinearFilter;
    this.imgMesh = new THREE.Mesh(new THREE.PlaneGeometry(
        size.w, size.h), new THREE.MeshBasicMaterial({
            map: srcTexture
    }));
    this.imgMesh.position.z = -1;
    this.scene.add(this.imgMesh);
   
    /*
    console.log(callback)
    if (callback) {
        callback();
    }
    */

    function process() {
        that.composer.render();
        // read pixels of edge detection
        var gl = that.renderer.getContext();
        
        var iw = size.w;
        var ih = size.h;
        var pixels = new Uint8Array(iw * ih * 4);
        gl.readPixels(size.ow, size.oh, size.w, size.h,
            gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        

        that.vertices = [[0, 0], [0, 1], [1, 0], [1, 1]];
        // append to vertex array
        var len = iw * ih;
        var loops = 0;
        var i = 4;
        // select those edges that in lastSelected
        for (var xi in that.lastSelected) {
            var x = parseInt(xi, 10);
            if (that.lastSelected[xi] != undefined) {
                for (var yi = that.lastSelected[xi].length; yi >= 0; --yi) {
                    var y = that.lastSelected[xi][yi];
                    var id = y * iw + x;
                    var red = pixels[id * 4];
                    if (red > 40 && Math.random() > 0.2) {
                        that._setThisSelected(xi, y);
                        that.vertices.push([x / iw, y / ih]);
                        ++i;
                    }
                }
            }
        }
        var edgeCnt = Math.floor(that.maxVertexCnt * 0.95);
        var maxLoop = that.maxVertexCnt * 100;
        for (; i < edgeCnt && loops < maxLoop; ++i, ++loops) {
            var id = Math.floor(Math.random() * len);
            var x = id % iw;
            var y = Math.floor(id / iw);
            var red = pixels[id * 4];
            if (red > 100 || red > Math.random() * 100) {
                // is a selected edge vertex
                if (!that.isImg) {
                    that._setThisSelected(x, y);
                }

                that.vertices.push([x / iw, y / ih]);
            } else {
                --i;
            }
        }

        for (; i < that.maxVertexCnt; ++i) {
            // randomly selected vertices will not push to thisSelected
            var rx = Math.random();
            var ry = Math.random();
            that.vertices.push([rx, ry]);
            if (!that.isImg) {
                that._setThisSelected(Math.floor(rx * iw),
                        Math.floor(ry * ih));
            }
        }

        // calculate delaunay triangles
        that.triangles = Delaunay.triangulate(that.vertices);

        // render triangle meshes
        that.renderTriangles(iw, ih);
    }





};



// render triangle meshes to screen
GlRenderer.prototype.renderTriangles = function(iw, ih) {
    this.faceMesh = [];
    var wireframeGeo = new THREE.Geometry();
    var vertices = this.vertices;
    var triangles = this.triangles;
    var size = this.getRenderSize();
    var iwn = this.srcImg.width;
    var ihn = this.srcImg.height;

    // face mesh
    var geo = new THREE.Geometry();
    var len = triangles.length;
    var fid = 0;
    for(var i = triangles.length - 1; i > 2; i -= 3) {
        // positions of three vertices
        var a = [vertices[triangles[i]][0] * size.w + size.dw,
                vertices[triangles[i]][1] * size.h + size.dh];
        var b = [vertices[triangles[i - 1]][0] * size.w + size.dw,
                vertices[triangles[i - 1]][1] * size.h + size.dh];
        var c = [vertices[triangles[i - 2]][0] * size.w + size.dw,
                vertices[triangles[i - 2]][1] * size.h + size.dh];

        // fill with color in center of gravity
        var x = Math.floor((vertices[triangles[i]][0]
                + vertices[triangles[i - 1]][0]
                + vertices[triangles[i - 2]][0]) / 3 * iwn);
        var y = ihn - Math.floor((vertices[triangles[i]][1]
                + vertices[triangles[i - 1]][1]
                + vertices[triangles[i - 2]][1]) / 3 * ihn);
        x = Math.min(iwn, Math.max(0, x - 1));
        y = Math.min(ihn, Math.max(0, y - 1));
        var id = (y * iwn + x) * 4;
        var rgb = 'rgb(' + this.srcPixel[id] + ', ' + this.srcPixel[id + 1]
                + ', ' + this.srcPixel[id + 2] + ')';

        // draw the triangle


        var nuevo_z = Math.floor(Math.random()*10);
        var nuevo_z2 = Math.floor(Math.random()*10);
        var nuevo_z3 = Math.floor(Math.random()*10);
        geo.vertices.push(new THREE.Vector3(a[0], a[1], nuevo_z));
        geo.vertices.push(new THREE.Vector3(b[0], b[1], nuevo_z2));
        geo.vertices.push(new THREE.Vector3(c[0], c[1], nuevo_z3));

/*
        geo.vertices.push(new THREE.Vector3(a[0], a[1], 1));
        geo.vertices.push(new THREE.Vector3(b[0], b[1], 1));
        geo.vertices.push(new THREE.Vector3(c[0], c[1], 1));
        */

        geo.faces.push(new THREE.Face3(len - i - 1, len - i, len - i + 1));
        geo.faces[fid++].color = new THREE.Color(rgb);
    }

    geo.computeFaceNormals();
    this.faceMesh = new THREE.Mesh(geo, this.faceMaterial);
    this.finalScene.add(this.faceMesh);

    this.wireframeMesh = new THREE.Mesh(geo, this.wireframeMaterial);

    this.vertizacos = JSON.parse(JSON.stringify(geo.vertices));
    for (var i = 0; i < this.vertizacos.length; i++) {
        this.vertizacos[i].random_x = 0.5 - Math.random();
        this.vertizacos[i].random_y = 0.5 - Math.random();
        this.wireframeMesh.geometry.vertices[i].delta = {};
        this.wireframeMesh.geometry.vertices[i].delta.x = 0;
        this.wireframeMesh.geometry.vertices[i].delta.y = 0;
    }

    this.wireframeMesh.position.z = 2;
    if (!this.hasWireframe) {
        this.wireframeMesh.visible = false;
    }

    //console.log(geo.vertices);
    this.renderFinal();
}

light=0.9;
GlRenderer.prototype.renderFinal = function() {

    /*
    if(window.mouse.w > 50 && light < 1){
        light = light+0.01;
        this.AmbientLight.intensity = light;
    }
    if(window.mouse.w < -50 && light >= 0){

        light = light-0.01;
        this.AmbientLight.intensity = light;
    }
    //console.log(light);
    */


    var nuevos_vertices = this.wireframeMesh.clone();
    nuevos_vertices.geometry.verticesNeedUpdate = true;


    var x_mouse = (+window.mouse.x) - this._renderSize.ow + this._renderSize.dw;
    var y_mouse = (-window.mouse.y) + this._renderSize.oh - this._renderSize.dh;

    this.light1.position.set( x_mouse, y_mouse, 15 );

    /*
    if((this.final - this.principio) >= 0){

        for (var i = 0; i < nuevos_vertices.geometry.vertices.length; i++) {

            nuevos_vertices.geometry.vertices[i].y = this.vertizacos[i].y + (this.final - this.principio)*this.vertizacos[i].random_x*10;
            nuevos_vertices.geometry.vertices[i].x = this.vertizacos[i].x + (this.final - this.principio)*this.vertizacos[i].random_y*10;

        }
    }
    */

    var mayor_longitud = this.canvas.height;
    if(this.canvas.width > this.canvas.height){
        mayor_longitud = this.canvas.width;
    }


    var fxD = 0.1;
    var fxS = 0.1;
    var fxJ = 0.0001;
    var mD = mayor_longitud/25;
    var mC = 1;
    var mP = mayor_longitud/50;
    var x = 0;
    var y = 0;
    var d = 0;

    for (var i = 0; i < nuevos_vertices.geometry.vertices.length; i++) {

        nuevos_vertices.geometry.vertices[i].delta.x += (this.vertizacos[i].x - nuevos_vertices.geometry.vertices[i].x ) * fxS + (Math.random() - 0.5) * fxJ;
        nuevos_vertices.geometry.vertices[i].delta.y += (this.vertizacos[i].y - nuevos_vertices.geometry.vertices[i].y ) * fxS + (Math.random() - 0.5) * fxJ;
        nuevos_vertices.geometry.vertices[i].delta.x *= fxD;
        nuevos_vertices.geometry.vertices[i].delta.y *= fxD;
        nuevos_vertices.geometry.vertices[i].x += nuevos_vertices.geometry.vertices[i].delta.x;
        nuevos_vertices.geometry.vertices[i].y += nuevos_vertices.geometry.vertices[i].delta.y;


        if(!window.mouse.buttonRaw || is_touch_device()){
            x = nuevos_vertices.geometry.vertices[i].x - x_mouse;
            y = nuevos_vertices.geometry.vertices[i].y - y_mouse;
            d = Math.sqrt(x * x + y * y);

            if(d < mD){
                x /= d;
                y /= d;
                d /= mD;
                d = (1-Math.pow(d,mC)) * mP;
                nuevos_vertices.geometry.vertices[i].x += x * d;
                nuevos_vertices.geometry.vertices[i].y += y * d;
            }
        }
        


    }

    this.finalScene.add(nuevos_vertices);



    this.renderer.render(this.finalScene, this.camera);

    ++this.principio;
    //console.log(this.principio);
    requestAnimationFrame(this.renderFinal.bind(this));
};



GlRenderer.prototype.resize = function() {
    // TODO: this function still not works yet
    var h = this.canvas.height;
    var w = this.canvas.width;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);

    this._renderSize = null; // flag to recalculate
};



// render origin image to get pixel color
GlRenderer.prototype.preRender = function(callback) {
    // original image
    this.srcImg = new Image();
    this.srcImg.src = this.imgPath;

    var that = this;
    var img = this.srcImg;
    this.srcImg.onload = function() {
        // tmp canvas
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var srcCtx = canvas.getContext('2d');
        srcCtx.drawImage(img, 0, 0, img.width, img.height);

        that.srcPixel = srcCtx.getImageData(0, 0, img.width, img.height).data;

        that.render();


        

        if (callback) {
            callback();
        }
    };
}



GlRenderer.prototype.getRenderSize = function(imgWidth, imgHeight) {
    if (this._renderSize) {
        return this._renderSize;
    }

    var imgWidth = this.srcImg.width;
    var imgHeight = this.srcImg.height;

    var cw = this.canvas.width;
    var ch = this.canvas.height;

    var iw = imgWidth;
    var ih = imgHeight;

    if (cw / ch > iw / ih) {
        /* |----------------------|
         * |    |************|    |
         * |    |************|    |
         * |    |************|    |
         * |    |************|    |
         * |----------------------|
         */
        // clip left and right part of the canvas
        var w = Math.floor(ch / ih * iw);
        var h = ch;
        var ow = Math.floor((cw - w) / 2); // offset
        var oh = 0;
    } else {
        /* |----------------------|
         * |                      |
         * |----------------------|
         * |**********************|
         * |**********************|
         * |----------------------|
         * |                      |
         * |----------------------|
         */
        // clip top and bottom part of the canvas
        var w = cw;
        var h = Math.floor(cw / iw * ih);
        var ow = 0;
        var oh = Math.floor((ch - h) / 2);
    }

    this._renderSize = {
        w: w,
        h: h,
        dw: Math.floor(ow - cw / 2),
        dh: Math.floor(oh - ch / 2),
        ow: ow,
        oh: oh
    };
    return this._renderSize;
}
