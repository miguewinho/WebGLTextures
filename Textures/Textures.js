//////////////////////////////////////////////////////////////////////////////
//
//  WebGL_example_28.js 
//
//  Applying a texture
//
//  Adapted from learningwebgl.com
//
//  J. Madeira - November 2015
//
//////////////////////////////////////////////////////////////////////////////


//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context

var shaderProgram = null; 

// NEW --- Buffers

var cubeVertexPositionBuffer = null;

var cubeVertexIndexBuffer = null;

var cubeVertexTextureCoordBuffer = [];

// The global transformation parameters

// The translation vector

var tx = 0.0;

var ty = 0.0;

var tz = 0.0;

// The rotation angles in degrees
var angleYY=[];
var angleXX=[];
var angleZZ=[];

angleXX[0] = 0.0;

angleYY[0] = 0.0;

angleZZ[0] = 0.0;

angleXX[1] = 0.0;

angleYY[1] = 0.0;

angleZZ[1] = 0.0;

// The scaling factors
var sx=sz=sy=[];

sx[0] = 0.25;

sy[0] = 0.25;

sz[0] = 0.25;

sx[1] = 0.25;

sy[1] = 0.25;

sz[1] = 0.25;

// NEW - Animation controls
var rotationXX_ON=[];
var rotationZZ_ON=[];
var rotationYY_ON=[];


//var rotationXX_DIR=rotationYY_DIR=rotationZZ_DIR=[];
//var rotationXX_SPEED=rotationYY_SPEED=rotationZZ_SPEED=[];
//XX
rotationXX_ON[0] = 0;
rotationXX_ON[1] = 0;

var rotationXX_DIR = 1;
var rotationXX_SPEED = 1;
 
//YY 
rotationYY_ON[0] = 0;
rotationYY_ON[1] = 0;

var rotationYY_DIR = 1;
var rotationYY_SPEED = 1;
 //ZZ
rotationZZ_ON[0] = 0;
rotationZZ_ON[1] = 0;

var rotationZZ_DIR= 1;
var rotationZZ_SPEED = 1;
 
// To allow choosing the way of drawing the model triangles

var primitiveType = null;
 
// To allow choosing the projection type

var projectionType = [0,0];

//Blending Flag

var blendisOn = [false,false];

//Cube index

var indice = 0;

//NxN repetition per face

var numberoftexturesn=[1,1];

var numberoftexturesm=[1,1];

//Luminance Flag

var luminance = [false,false];

//ALPHA Flag

var alphaflag = [false,false];

//Number of faces

var facesnum=[6,6];
 
// From learningwebgl.com

// NEW --- Storing the vertices defining the cube faces

vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
];

var textureCoords2 = [

          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,

          // Back face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,

          // Bottom face
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          // Right face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Left face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
];

// Texture coordinates for the quadrangular faces

// Notice how they are assigne to the corresponding vertices

var textureCoords = [

          // Front face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,

          // Back face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,

          // Bottom face
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          // Right face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Left face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
];

// Vertex indices defining the triangles
        
var cubeVertexIndices = [

            0, 1, 2,      0, 2, 3,    // Front face

            4, 5, 6,      4, 6, 7,    // Back face

            8, 9, 10,     8, 10, 11,  // Top face

            12, 13, 14,   12, 14, 15, // Bottom face

            16, 17, 18,   16, 18, 19, // Right face

            20, 21, 22,   20, 22, 23  // Left face
];
         
         
//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Textures

// From www.learningwebgl.com

function handleLoadedTexture(texture) {
		
	const data = new Uint8Array([
  128,  64, 128,
    0, 192,   0,
]);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.bindTexture(gl.TEXTURE_2D, null);
}


var webGLTexture=[];

function initTexture() {
	
	webGLTexture.push(gl.createTexture());
	webGLTexture.push(gl.createTexture());
	webGLTexture[0].image = new Image();
	webGLTexture[0].image.onload = function () {
		handleLoadedTexture(webGLTexture[0])
	}

	webGLTexture[1].image = new Image();
	webGLTexture[1].image.onload = function () {
		handleLoadedTexture(webGLTexture[1])
	}

	var url1 = "https://webglfundamentals.org/webgl/resources/f-texture.png";
	if ((new URL(url1)).origin !== window.location.origin) {
      webGLTexture[0].image.crossOrigin = "";
    }
	webGLTexture[0].image.src = url1;

	var url2 = "https://webglfundamentals.org/webgl/resources/f-texture.png";
	if ((new URL(url2)).origin !== window.location.origin) {
      webGLTexture[1].image.crossOrigin = "";
    }	
	webGLTexture[1].image.src = url2;
}

//----------------------------------------------------------------------------

// Handling the Buffers

function initBuffers() {	
	
	// Coordinates
		
	cubeVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	cubeVertexPositionBuffer.itemSize = 3;
	cubeVertexPositionBuffer.numItems = vertices.length / 3;			

	// Textures
		
    cubeVertexTextureCoordBuffer.push(gl.createBuffer());
    cubeVertexTextureCoordBuffer.push(gl.createBuffer());
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer[0]);
 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer[0].itemSize = 2;
    cubeVertexTextureCoordBuffer[0].numItems = 24;	

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer[1]);
 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer[1].itemSize = 2;
    cubeVertexTextureCoordBuffer[1].numItems = 24;			

	// Vertex indices
	
    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( angleXX, angleYY, angleZZ, 
					sx, sy, sz,
					tx, ty, tz,
					mvMatrix,
					primitiveType , texture,texturecoordbuffer) {

    // Pay attention to transformation order !!
    
	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
						 
	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );
	
	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );
	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( angleXX) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( sx, sy, sz ) );
						 
	// Passing the Model View Matrix to apply the current transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));

    // Passing the buffers
    	
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

	// NEW --- Textures
	
	gl.bindBuffer(gl.ARRAY_BUFFER, texturecoordbuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, texturecoordbuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
        
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    // NEW --- Blending

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
           
    var alpha = 0.5;
           
    gl.uniform1f(shaderProgram.alphaUniform, alpha);
    
    // The vertex indices
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

	// Drawing the triangles --- NEW --- DRAWING ELEMENTS 
	
	gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	// Clearing with the background color
	
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// NEW --- Computing the Projection Matrix
	
	if( projectionType[indice] == 0 ) {
		
		// For now, the default orthogonal view volume
		
		pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );
		
		tz = 0;
	}
	else {	

		// A standard view volume.
		
		// Viewer is at (0,0,0)
		
		// Ensure that the model is "inside" the view volume
		
		pMatrix = perspective( 45, 1, 0.05, 10 );
		
		tz = -2.25;

	}
	
	// Passing the Projection Matrix to apply the current projection
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// NEW --- Instantianting the same model more than once !!
	
	// And with diferent transformation parameters !!
	
	// Call the drawModel function !!
	
	// Instance 1 --- RIGHT TOP

	if(blendisOn[0]){
		gl.enable(gl.BLEND);
	    gl.disable( gl.DEPTH_TEST );
	}else{
		gl.disable(gl.BLEND);
	    gl.enable( gl.DEPTH_TEST);
	}
	
	drawModel( -angleXX[0], angleYY[0], angleZZ[0], 
	           sx[0], sy[0], sz[0],
	           tx-0.5, ty, tz,
	           mvMatrix,
	           primitiveType[0],webGLTexture[0],cubeVertexTextureCoordBuffer[0]);

	if(blendisOn[1]){
		gl.enable(gl.BLEND);
	    gl.disable( gl.DEPTH_TEST );
	}else{
		gl.disable(gl.BLEND);
	    gl.enable( gl.DEPTH_TEST);
	}

	drawModel( -angleXX[1], angleYY[1], angleZZ[1], 
	           sx[1], sy[1], sz[1],
	           tx+0.5, ty, tz,
	           mvMatrix,
	           primitiveType[1],webGLTexture[1],cubeVertexTextureCoordBuffer[1]);


	           
}

//----------------------------------------------------------------------------
//
//  NEW --- Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	
	var timeNow = new Date().getTime();
	
	if( lastTime != 0 ) {
		
		var elapsed = timeNow - lastTime;
		
		if( rotationXX_ON[indice] ) {

			angleXX[indice] += rotationXX_DIR * rotationXX_SPEED* (90 * elapsed) / 1000.0;
	    }

		if( rotationYY_ON[indice] ) {

			angleYY[indice] += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( rotationZZ_ON[indice] ) {

			angleZZ[indice] += rotationZZ_DIR * rotationZZ_SPEED * (90 * elapsed) / 1000.0;
	    }
	}
	
	lastTime = timeNow;
}

//----------------------------------------------------------------------------

// Handling keyboard events

// Adapted from www.learningwebgl.com

var currentlyPressedKeys = {};

function handleKeys() {
	
	if (currentlyPressedKeys[33]) {
		
		// Page Up
		
		sx[indice] *= 0.9;
		
		sz[indice] *= 0.9;

		sy[indice] *= 0.9;
	}
	if (currentlyPressedKeys[34]) {
		
		// Page Down
		
		sx[indice]*= 1.1;
		
		sz[indice]*= 1.1;

		sy[indice] *= 1.1;
	}
}

//----------------------------------------------------------------------------

// Handling mouse events

// Adapted from www.learningwebgl.com


var mouseDown = false;

var lastMouseX = null;

var lastMouseY = null;

function handleMouseDown(event) {
	
    mouseDown = true;
  
    lastMouseX = event.clientX;
  
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {

    mouseDown = false;
}

function handleMouseMove(event) {

    if (!mouseDown) {
	  
      return;
    } 
  
    // Rotation angles proportional to cursor displacement
    
    var newX = event.clientX;
  
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    
    angleYY[indice] += radians( 50 * deltaX  )

    var deltaY = newY - lastMouseY;
    
    angleXX[indice] -= radians( 50 * deltaY  )
    
    lastMouseX = newX
    
    lastMouseY = newY;
  }
//----------------------------------------------------------------------------

// Timer

function tick() {
	
	requestAnimFrame(tick);
	
	// NEW --- Processing keyboard events 
	
	handleKeys();
	
	drawScene();
	
	animate();
}




//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){
		
}

//----------------------------------------------------------------------------

function setEventListeners( canvas ){
	
	// NEW ---Handling the mouse
	
	// From learningwebgl.com

    canvas.onmousedown = handleMouseDown;
    
    document.onmouseup = handleMouseUp;
    
    document.onmousemove = handleMouseMove;
    
    // NEW ---Handling the keyboard
	
	// From learningwebgl.com

    function handleKeyDown(event) {
		
        currentlyPressedKeys[event.keyCode] = true;
    }

    function handleKeyUp(event) {
		
        currentlyPressedKeys[event.keyCode] = false;
    }

	document.onkeydown = handleKeyDown;
    
    document.onkeyup = handleKeyUp;
	
	// Dropdown list
	
	var projection = document.getElementById("projection-selection");
	
	projection.addEventListener("click", function(){
				
		// Getting the selection
		
		var p = projection.selectedIndex;
				
		switch(p){
			
			case 0 : projectionType[indice] = 0;
				break;
			
			case 1 : projectionType[indice] = 1;
				break;
		}  	
	}); 

	var index = document.getElementById("id-selection");
	
	index.addEventListener("click", function(){
				
		// Getting the selection
		
		var p = index.selectedIndex;
				
		switch(p){
			
			case 0 : indice = 0;
				break;
			
			case 1 : indice = 1;
				break;
		}  	
	}); 

	document.getElementById("change-Size").onclick = function(){
		var x = document.getElementById("frm1");
		
		if(x.elements[0].value<=3 && x.elements[0].value>=0) sx[indice] = x.elements[0].value/10;
		if(x.elements[1].value<=3 && x.elements[1].value>=0) sy[indice] = x.elements[1].value/10;
		if(x.elements[2].value<=3 && x.elements[2].value>=0) sz[indice] = x.elements[2].value/10;
	};   

	document.getElementById("change-rep").onclick = function(){
		var x = document.getElementById("frm2");
		
		textureCoords=[];
		if(x.elements[0].value<=5 && x.elements[0].value>=0.0) numberoftexturesn[indice] = x.elements[0].value;
		if(x.elements[1].value<=5 && x.elements[1].value>=0.0) numberoftexturesm[indice] = x.elements[1].value;

		for (var i = 0; i < 8*facesnum[indice]; i++) {
			textureCoords[i]=textureCoords2[i]*numberoftexturesn[indice];
			i++;
			textureCoords[i]=textureCoords2[i]*numberoftexturesm[indice];
		}
		cubeVertexTextureCoordBuffer[indice] = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer[indice]);
	 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	    cubeVertexTextureCoordBuffer[indice].itemSize = 2;
	    cubeVertexTextureCoordBuffer[indice].numItems = 24;	
	}; 

	document.getElementById("text-file").onchange = function(){
		var file = this.files[0];
		webGLTexture[indice].image.src = file["name"];

		luminance[indice] = false;
	};

	document.getElementById("link-src").onclick = function(){
		var x = document.getElementById("frm3");
		var url = "https://cors-anywhere.herokuapp.com/"+x.elements[0].value;
		if ((new URL(url)).origin !== window.location.origin) {
      		webGLTexture[indice].image.crossOrigin = "";
    	}
    	luminance[indice] = false;
    	alphaflag = false;
    	webGLTexture[indice].image.src = url;
	};

	document.getElementById("lum-button").onclick = function(){
		console.log(luminance);
		gl.bindTexture(gl.TEXTURE_2D, webGLTexture[indice]);
		if(!luminance[indice]){
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, gl.LUMINANCE, gl.UNSIGNED_BYTE, webGLTexture[indice].image);
			alphaflag[indice] = false;
		}else{
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webGLTexture[indice].image);
		}
		luminance[indice] = !luminance[indice];
	}

	document.getElementById("alpha-button").onclick = function(){
		/*if(!alphaflag[indice]){
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, gl.ALPHA, gl.UNSIGNED_BYTE, webGLTexture.image);
			luminance[indice] = false;
		}else{
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webGLTexture.image);
		}
		alphaflag[indice] = !alphaflag[indice];*/
	}


	// Button events
	
	document.getElementById("rotx-button").onclick = function(){
		
		// Switching on / off
		
		if( rotationXX_ON[indice] ) {
			
			rotationXX_ON[indice] = 0;
		}
		else {
		
			rotationXX_ON[indice] = 1;
		} 
	
	};     

	document.getElementById("roty-button").onclick = function(){
		
		// Switching on / off
		
		if( rotationYY_ON[indice] ) {
			
			rotationYY_ON[indice] = 0;
		}
		else {
			
			rotationYY_ON[indice] = 1;
		}  
	};     

	document.getElementById("rotz-button").onclick = function(){
		
		// Switching on / off
		
		if( rotationZZ_ON[indice] ) {
			
			rotationZZ_ON[indice] = 0;
		}
		else {
			
			rotationZZ_ON[indice] = 1;
		}  
	};

	document.getElementById("blend-button").onclick = function(){
	   

		if(!blendisOn[indice]){
	    	blendisOn[indice] = true;

	    }else{
	    	blendisOn[indice] = false;
	    }
	};

	document.getElementById("repeath-button").onclick = function(){
		gl.bindTexture(gl.TEXTURE_2D, webGLTexture[indice]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);	//horizontal

	}

	document.getElementById("clamph-button").onclick = function(){
		gl.bindTexture(gl.TEXTURE_2D, webGLTexture[indice]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);	//horizontal

	}

	document.getElementById("mirrorh-button").onclick = function(){
		gl.bindTexture(gl.TEXTURE_2D, webGLTexture[indice]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);	//horizontal

	}

	document.getElementById("repeatv-button").onclick = function(){
		gl.bindTexture(gl.TEXTURE_2D, webGLTexture[indice]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);	//vertical

	}

	document.getElementById("clampv-button").onclick = function(){
		gl.bindTexture(gl.TEXTURE_2D, webGLTexture[indice]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);	//vertical

	}

	document.getElementById("mirrorv-button").onclick = function(){
		gl.bindTexture(gl.TEXTURE_2D, webGLTexture[indice]);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);	//vertical

	}

	var repetition = document.getElementById("repetition-selection");
	
	repetition.addEventListener("click", function(){
				
		// Getting the selection
		
		var p = repetition.selectedIndex;

		textureCoords = [];
				
		switch(p){
			
			case 0 : 
					facesnum[indice]=1;
					for (var i = 0; i < 8; i++) {
						textureCoords[i] = textureCoords2[i]*numberoftexturesn[indice];
						i++;
						textureCoords[i] = textureCoords2[i]*numberoftexturesm[indice];
					}
				break;
			
			case 1 : 
					facesnum[indice]=2;
					for (var i = 0; i < 16; i++) {
						textureCoords[i] = textureCoords2[i]*numberoftexturesn[indice];
						i++;
						textureCoords[i] = textureCoords2[i]*numberoftexturesm[indice];
					}	
				break;

			case 2 : 
					facesnum[indice]=3;
					for (var i = 0; i < 24; i++) {
						textureCoords[i] = textureCoords2[i]*numberoftexturesn[indice];
						i++;
						textureCoords[i] = textureCoords2[i]*numberoftexturesm[indice];
					}
				break;

			case 3 : 
					facesnum[indice]=4;
					for (var i = 0; i < 32; i++) {
						textureCoords[i] = textureCoords2[i]*numberoftexturesn[indice];
						i++;
						textureCoords[i] = textureCoords2[i]*numberoftexturesm[indice];
					}	
				break;

			case 4 : 
					facesnum[indice]=5;
					for (var i = 0; i < 40; i++) {
						textureCoords[i] = textureCoords2[i]*numberoftexturesn[indice];
						i++;
						textureCoords[i] = textureCoords2[i]*numberoftexturesm[indice];
					}
				break;

			case 5 : 
					facesnum[indice]=6;
					for (var i = 0; i < 48; i++) {
						textureCoords[i] = textureCoords2[i]*numberoftexturesn[indice];
						i++;
						textureCoords[i] = textureCoords2[i]*numberoftexturesm[indice];
					}

				break;
		}  	
		cubeVertexTextureCoordBuffer[indice] = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer[indice]);
	 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	    cubeVertexTextureCoordBuffer[indice].itemSize = 2;
	    cubeVertexTextureCoordBuffer[indice].numItems = 24;	
	});

	document.getElementById("reset-button").onclick = function(){
		// The initial values

		tx = 0.0;

		ty = 0.0;

		tz = 0.0;

		angleXX[indice] = 0.0;

		angleYY[indice] = 0.0;

		angleZZ[indice] = 0.0;

		sx[indice] = 0.25;

		sy[indice] = 0.25;

		sz[indice] = 0.25;
		//xx
		rotationXX_ON[indice] = 0;
		
		rotationXX_DIR = 1;
		
		rotationXX_SPEED = 1;
		//yy
		rotationYY_ON[indice] = 0;
		
		rotationYY_DIR = 1;
		
		rotationYY_SPEED = 1;
		//zz
		rotationZZ_ON[indice] = 0;
		
		rotationZZ_DIR= 1;
		
		rotationZZ_SPEED= 1;

		numberoftextures = 1;

		facesnum[indice] = 6;

		textureCoords = textureCoords2;

		gl.disable(gl.BLEND);

	    gl.enable( gl.DEPTH_TEST );

	    blendisOn[indice] = false;

	    luminance[indice] = false;

	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);	//vertical
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);	//horizontal

		cubeVertexTextureCoordBuffer[indice] = gl.createBuffer();
	    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer[indice]);
	 	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	    cubeVertexTextureCoordBuffer[indice].itemSize = 2;
	    cubeVertexTextureCoordBuffer[indice].numItems = 24;

	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webGLTexture[0].image);

	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webGLTexture[1].image);
	};
}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
	try {
		
		// Create the WebGL context
		
		// Some browsers still need "experimental-webgl"
		
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		// DEFAULT: The viewport occupies the whole canvas 
		
		// DEFAULT: The viewport background color is WHITE
		
		// NEW - Drawing the triangles defining the model
		
		primitiveType = gl.TRIANGLES;
		
		// DEFAULT: The Depth-Buffer is DISABLED
		
		// Enable it !
		
		gl.enable( gl.DEPTH_TEST );
		
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

//----------------------------------------------------------------------------

function runWebGL() {
	
	var canvas = document.getElementById("my-canvas");
		
	initWebGL( canvas );

	shaderProgram = initShaders( gl );
	
	setEventListeners( canvas );
	
	initBuffers();
	
	initTexture();
	
	tick();		// A timer controls the rendering / animation    

	outputInfos();
}


