//////////////////////////////////////////////////////////////////////////////
//
//  WebGL_example_24_GPU_per_vertex.js 
//
//  Phong Illumination Model on the GPU - Per vertex shading - Several light sources
//
//  Reference: E. Angel examples
//
//  J. Madeira - November 2017 + November 2018
//
//////////////////////////////////////////////////////////////////////////////


//----------------------------------------------------------------------------
//
// Global Variables
//

var gl = null; // WebGL context

var shaderProgram = null;

var triangleVertexPositionBuffer = null;
	
var triangleVertexNormalBuffer = null;	

// The GLOBAL transformation parameters

var globalAngleYY = 0.0;

var globalAngleXX = 0.0;

var globalTz = 0.0;

// GLOBAL Animation controls

var globalRotationYY_ON = 0;

var globalRotationYY_DIR = 1;

var globalRotationYY_SPEED = 1;

var globalRotationXX_ON = 0;

var globalRotationXX_DIR = 1;

var globalRotationXX_SPEED = 1;

// To allow choosing the way of drawing the model triangles

var primitiveType = null;
 
// To allow choosing the projection type

var projectionType = 0;

// NEW --- The viewer position

// It has to be updated according to the projection type

var pos_Viewer = [ 0.0, 0.0, 0.0, 1.0 ];


//----------------------------------------------------------------------------
//
// NEW - To count the number of frames per second (fps)
//

var elapsedTime = 0;

var frameCount = 0;

var lastfpsTime = new Date().getTime();;


function countFrames() {
	
   var now = new Date().getTime();

   frameCount++;
   
   elapsedTime += (now - lastfpsTime);

   lastfpsTime = now;

   if(elapsedTime >= 1000) {
	   
       fps = frameCount;
       
       frameCount = 0;
       
       elapsedTime -= 1000;
	   
	   document.getElementById('fps').innerHTML = 'fps:' + fps;
   }
}


//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex Coordinates and the Vertex Normal Vectors

function initBuffers( model ) {	
	
	// Vertex Coordinates
		
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems =  model.vertices.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
	
	// Vertex Normal Vectors
		
	triangleVertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( model.normals), gl.STATIC_DRAW);
	triangleVertexNormalBuffer.itemSize = 3;
	triangleVertexNormalBuffer.numItems = model.normals.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 
			triangleVertexNormalBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);	
}

//----------------------------------------------------------------------------

//  Drawing the model

function drawModel( model,
					mvMatrix,
					primitiveType ) {

	// The the global model transformation is an input
	
	// Concatenate with the particular model transformations
	
    // Pay attention to transformation order !!
    
	mvMatrix = mult( mvMatrix, translationMatrix( model.tx, model.ty, model.tz ) );
						 
	mvMatrix = mult( mvMatrix, rotationZZMatrix( model.rotAngleZZ ) );
	
	mvMatrix = mult( mvMatrix, rotationYYMatrix( model.rotAngleYY ) );
	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( model.rotAngleXX ) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( model.sx, model.sy, model.sz ) );
						 
	// Passing the Model View Matrix to apply the current transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
    
	// Associating the data to the vertex shader
	
	// This can be done in a better way !!

	// Vertex Coordinates and Vertex Normal Vectors
	
	initBuffers(model);
	
	// Material properties
	
	gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_ambient"), 
		flatten(model.kAmbi) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_diffuse"),
        flatten(model.kDiff) );
    
    gl.uniform3fv( gl.getUniformLocation(shaderProgram, "k_specular"),
        flatten(model.kSpec) );

	gl.uniform1f( gl.getUniformLocation(shaderProgram, "shininess"), 
		model.nPhong );

    // Light Sources
	
	var numLights = lightSources.length;
	
	gl.uniform1i( gl.getUniformLocation(shaderProgram, "numLights"), 
		numLights );

	//Light Sources
	
	for(var i = 0; i < lightSources.length; i++ )
	{
		gl.uniform1i( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].isOn"),
			lightSources[i].isOn );
    
		gl.uniform4fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].position"),
			flatten(lightSources[i].getPosition()) );
    
		gl.uniform3fv( gl.getUniformLocation(shaderProgram, "allLights[" + String(i) + "].intensities"),
			flatten(lightSources[i].getIntensity()) );
    }
        
	// Drawing 
	
	// primitiveType allows drawing as filled triangles / wireframe / vertices
	
	if( primitiveType == gl.LINE_LOOP ) {
		
		// To simulate wireframe drawing!
		
		// No faces are defined! There are no hidden lines!
		
		// Taking the vertices 3 by 3 and drawing a LINE_LOOP
		
		var i;
		
		for( i = 0; i < triangleVertexPositionBuffer.numItems / 3; i++ ) {
		
			gl.drawArrays( primitiveType, 3 * i, 3 ); 
		}
	}	
	else {
				
		gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems); 
		
	}	
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	// Clearing the frame-buffer and the depth-buffer
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Computing the Projection Matrix
	
	if( projectionType == 0 ) {
		
		// For now, the default orthogonal view volume
		
		pMatrix = ortho( -1.0, 1.0, -1.0, 1.0, -1.0, 1.0 );
		
		// Global transformation !!
		
		globalTz = 0.0;
		
		// NEW --- The viewer is on the ZZ axis at an indefinite distance
		
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[3] = 0.0;
		
		pos_Viewer[2] = 1.0;  
		
		// TO BE DONE !
		
		// Allow the user to control the size of the view volume
	}
	else {	

		// A standard view volume.
		
		// Viewer is at (0,0,0)
		
		// Ensure that the model is "inside" the view volume
		
		pMatrix = perspective( 45, 1, 0.05, 15 );
		
		// Global transformation !!
		
		globalTz = -2.5;

		// NEW --- The viewer is on (0,0,0)
		
		pos_Viewer[0] = pos_Viewer[1] = pos_Viewer[2] = 0.0;
		
		pos_Viewer[3] = 1.0;  
		
		// TO BE DONE !
		
		// Allow the user to control the size of the view volume
	}
	
	// Passing the Projection Matrix to apply the current projection
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// NEW --- Passing the viewer position to the vertex shader
	
	gl.uniform4fv( gl.getUniformLocation(shaderProgram, "viewerPosition"),
        flatten(pos_Viewer) );
	
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	
	mvMatrix = translationMatrix( 0, 0, globalTz );
	
	// NEW - Updating the position of the light sources, if required
	
	// FOR EACH LIGHT SOURCE
	    
	for(var i = 0; i < lightSources.length; i++ )
	{
		// Animating the light source, if defined
		    
		var lightSourceMatrix = mat4();

		if( !lightSources[i].isOff() ) {
				
			// COMPLETE THE CODE FOR THE OTHER ROTATION AXES

			if( lightSources[i].isRotYYOn() ) 
			{
				lightSourceMatrix = mult( 
						lightSourceMatrix, 
						rotationYYMatrix( lightSources[i].getRotAngleYY() ) );
			}
		}
		
		// NEW Passing the Light Souree Matrix to apply
	
		var lsmUniform = gl.getUniformLocation(shaderProgram, "allLights["+ String(i) + "].lightSourceMatrix");
	
		gl.uniformMatrix4fv(lsmUniform, false, new Float32Array(flatten(lightSourceMatrix)));
	}
			
	// Instantianting all scene models
	
	for(var i = 0; i < sceneModels.length; i++ )
	{ 
		drawModel( sceneModels[i],
			   mvMatrix,
	           primitiveType );
	}
	           
	// NEW - Counting the frames
	
	countFrames();
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
		
		// Global rotation
		
		if( globalRotationYY_ON ) {

			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

	    if( globalRotationXX_ON ) {

			globalAngleXX += globalRotationXX_DIR * globalRotationXX_SPEED * (90 * elapsed) / 1000.0;
	    }

		// For every model --- Local rotations
		
		/*for(var i = 0; i < sceneModels.length; i++ )
	    {
			if( sceneModels[i].rotXXOn ) {

				sceneModels[i].rotAngleXX += sceneModels[i].rotXXDir * sceneModels[i].rotXXSpeed * (90 * elapsed) / 1000.0;
			}

			if( sceneModels[i].rotYYOn ) {

				sceneModels[i].rotAngleYY += sceneModels[i].rotYYDir * sceneModels[i].rotYYSpeed * (90 * elapsed) / 1000.0;
			}

			if( sceneModels[i].rotZZOn ) {

				sceneModels[i].rotAngleZZ += sceneModels[i].rotZZDir * sceneModels[i].rotZZSpeed * (90 * elapsed) / 1000.0;
			}
		}*/
		
		// Rotating the light sources
	
		for(var i = 0; i < lightSources.length; i++ )
	    {
			if( lightSources[i].isRotYYOn() ) {

				var angle = lightSources[i].getRotAngleYY() + lightSources[i].getRotationSpeed() * (90 * elapsed) / 1000.0;
		
				lightSources[i].setRotAngleYY( angle );
			}
		}
}
	
	lastTime = timeNow;
}

//----------------------------------------------------------------------------

// Handling mouse events

// Adapted from www.learningwebgl.com

var mouseDown = false;

var lastMouseX = [null,null];

var lastMouseY = [null,null];

function handleMouseDown(event) {
	
    mouseDown = true;

    for (var i = 0; i < 2; i++) {
    	lastMouseX[i] = event.clientX;
  
    	lastMouseY[i] = event.clientY;
    }
}

function handleMouseUp(event) {

    mouseDown = false;
}

function handleMouseMove(event) {

    if (!mouseDown) {
	  
      return;
    } 
  
  	for (var i = 0; i < sceneModels.length; i++) {
	    // Rotation angles proportional to cursor displacement
	    
	    var newX = event.clientX;
	  
	    var newY = event.clientY;

	    var deltaX = newX - lastMouseX[i];
	    
	    sceneModels[i].rotAngleYY += radians( 20 * deltaX  )

	    var deltaY = newY - lastMouseY[i];
	    
	    sceneModels[i].rotAngleXX += radians( 20 * deltaY  )
	    
	    lastMouseX[i] = newX
	    
	    lastMouseY[i] = newY;
	}
}


//----------------------------------------------------------------------------

// Timer

function tick() {
	
	requestAnimFrame(tick);
	
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

function setEventListeners(canvas){

	// NEW ---Handling the mouse
	
	// From learningwebgl.com

    canvas.onmousedown = handleMouseDown;
    
    document.onmouseup = handleMouseUp;
    
    document.onmousemove = handleMouseMove;
	
    // Dropdown list
	
	var projection = document.getElementById("projection-selection");
	
	projection.addEventListener("click", function(){
				
		// Getting the selection
		
		var p = projection.selectedIndex;
				
		switch(p){
			
			case 0 : projectionType = 0;
				break;
			
			case 1 : projectionType = 1;
				break;
		}  	
	});      

	// Dropdown list
	
	var list = document.getElementById("rendering-mode-selection");
	
	list.addEventListener("click", function(){
				
		// Getting the selection
		
		var mode = list.selectedIndex;
				
		switch(mode){
			
			case 0 : primitiveType = gl.TRIANGLES;
				break;
			
			case 1 : primitiveType = gl.LINE_LOOP;
				break;
			
			case 2 : primitiveType = gl.POINTS;
				break;
		}
	}); 

	var texture = document.getElementById("texture-mode-selection1");
	
	texture.addEventListener("click", function(){
				
		// Getting the selection
		
		var p = texture.selectedIndex;
				
		switch(p){
			
			case 0 : 
				sceneModels[0].kAmbi = [ 0.21, 0.13, 0.05 ];
				sceneModels[0].kDiff = [ 0.71, 0.43, 0.18 ];
				sceneModels[0].kSpec = [ 0.39, 0.27, 0.17];
				sceneModels[0].nPhong = 25.6;

				break;
			
			case 1 :  
				sceneModels[0].kAmbi = [ 0.25, 0.15, 0.06 ];
				sceneModels[0].kDiff = [ 0.4, 0.24, 0.1 ];
				sceneModels[0].kSpec = [ 0.77, 0.46, 0.20 ];
				sceneModels[0].nPhong = 76.8;

				break;

			case 2 : 
				sceneModels[0].kAmbi = [ 0.19, 0.07, 0.02 ];
				sceneModels[0].kDiff = [ 0.7, 0.27, 0.08 ];
				sceneModels[0].kSpec = [ 0.26, 0.14, 0.08 ];
				sceneModels[0].nPhong = 12.8;

				break;

			case 3 : 
				sceneModels[0].kAmbi = [ 0.23, 0.08, 0.03 ];
				sceneModels[0].kDiff = [ 0.55, 0.21, 0.07 ];
				sceneModels[0].kSpec = [ 0.58, 0.22, 0.07 ];
				sceneModels[0].nPhong = 51.2;

				break;

			case 4 : 
				sceneModels[0].kAmbi = [ 0.25, 0.25, 0.25 ];
				sceneModels[0].kDiff = [ 0.4, 0.4, 0.4 ];
				sceneModels[0].kSpec = [ 0.77, 0.77, 0.77 ];
				sceneModels[0].nPhong = 76.8;

				break;

			case 5 : 
				sceneModels[0].kAmbi = [ 0.33, 0.22, 0.03 ];
				sceneModels[0].kDiff = [ 0.78, 0.57, 0.11 ];
				sceneModels[0].kSpec = [ 0.99, 0.94, 0.81 ];
				sceneModels[0].nPhong = 27.9;

				break;

			case 6 : 
				sceneModels[0].kAmbi = [ 0.25, 0.20, 0.07 ];
				sceneModels[0].kDiff = [ 0.75, 0.60, 0.23];
				sceneModels[0].kSpec = [ 0.63, 0.56, 0.37 ];
				sceneModels[0].nPhong = 51.2;

				break;

			case 7 : 
				sceneModels[0].kAmbi = [ 0.25, 0.22, 0.06 ];
				sceneModels[0].kDiff = [ 0.35, 0.31, 0.09 ];
				sceneModels[0].kSpec = [ 0.80, 0.73, 0.21 ];
				sceneModels[0].nPhong = 83.2;

				break;

			case 8 : 
				sceneModels[0].kAmbi = [ 0.23, 0.23, 0.23 ];
				sceneModels[0].kDiff = [ 0.28, 0.28, 0.28 ];
				sceneModels[0].kSpec = [ 0.77, 0.77, 0.77 ];
				sceneModels[0].nPhong = 89.6;

				break;

			case 9 : 
				sceneModels[0].kAmbi = [ 0.3, 0.0, 0.0 ];
				sceneModels[0].kDiff = [ 0.6, 0.0, 0.0 ];
				sceneModels[0].kSpec = [ 0.8, 0.6, 0.6 ];
				sceneModels[0].nPhong = 32.0;

				break;

			case 10 : 
				sceneModels[0].kAmbi = [ 0.0, 0.0, 0.5 ];
				sceneModels[0].kDiff = [ 0.0, 0.0, 1.0 ];
				sceneModels[0].kSpec = [ 1.0, 1.0, 1.0 ];
				sceneModels[0].nPhong = 125.0;

				break;

			case 11 : 
				sceneModels[0].kAmbi = [ 0.1, 0.1, 0.1 ];
				sceneModels[0].kDiff = [ 0.5, 0.5, 0.5 ];
				sceneModels[0].kSpec = [ 0.7, 0.7, 0.7 ];
				sceneModels[0].nPhong = 1.0;

				break;

		}  	
	});  

	var texture2 = document.getElementById("texture-mode-selection2");
	
	texture2.addEventListener("click", function(){
				
		// Getting the selection
		
		var p = texture2.selectedIndex;
				
		switch(p){
			
			case 0 : 
				sceneModels[1].kAmbi = [ 0.21, 0.13, 0.05 ];
				sceneModels[1].kDiff = [ 0.71, 0.43, 0.18 ];
				sceneModels[1].kSpec = [ 0.39, 0.27, 0.17];
				sceneModels[1].nPhong = 25.6;

				break;
			
			case 1 :  
				sceneModels[1].kAmbi = [ 0.25, 0.15, 0.06 ];
				sceneModels[1].kDiff = [ 0.4, 0.24, 0.1 ];
				sceneModels[1].kSpec = [ 0.77, 0.46, 0.20 ];
				sceneModels[1].nPhong = 76.8;

				break;

			case 2 : 
				sceneModels[1].kAmbi = [ 0.19, 0.07, 0.02 ];
				sceneModels[1].kDiff = [ 0.7, 0.27, 0.08 ];
				sceneModels[1].kSpec = [ 0.26, 0.14, 0.08 ];
				sceneModels[1].nPhong = 12.8;

				break;

			case 3 : 
				sceneModels[1].kAmbi = [ 0.23, 0.08, 0.03 ];
				sceneModels[1].kDiff = [ 0.55, 0.21, 0.07 ];
				sceneModels[1].kSpec = [ 0.58, 0.22, 0.07 ];
				sceneModels[1].nPhong = 51.2;

				break;

			case 4 : 
				sceneModels[1].kAmbi = [ 0.25, 0.25, 0.25 ];
				sceneModels[1].kDiff = [ 0.4, 0.4, 0.4 ];
				sceneModels[1].kSpec = [ 0.77, 0.77, 0.77 ];
				sceneModels[1].nPhong = 76.8;

				break;

			case 5 : 
				sceneModels[1].kAmbi = [ 0.33, 0.22, 0.03 ];
				sceneModels[1].kDiff = [ 0.78, 0.57, 0.11 ];
				sceneModels[1].kSpec = [ 0.99, 0.94, 0.81 ];
				sceneModels[1].nPhong = 27.9;

				break;

			case 6 : 
				sceneModels[1].kAmbi = [ 0.25, 0.20, 0.07 ];
				sceneModels[1].kDiff = [ 0.75, 0.60, 0.23];
				sceneModels[1].kSpec = [ 0.63, 0.56, 0.37 ];
				sceneModels[1].nPhong = 51.2;

				break;

			case 7 : 
				sceneModels[1].kAmbi = [ 0.25, 0.22, 0.06 ];
				sceneModels[1].kDiff = [ 0.35, 0.31, 0.09 ];
				sceneModels[1].kSpec = [ 0.80, 0.72, 0.21 ];
				sceneModels[1].nPhong = 83.2;

				break;

			case 8 : 
				sceneModels[1].kAmbi = [ 0.23, 0.23, 0.23 ];
				sceneModels[1].kDiff = [ 0.28, 0.28, 0.28 ];
				sceneModels[1].kSpec = [ 0.77, 0.77, 0.77 ];
				sceneModels[1].nPhong = 89.6;

				break;

			case 9 : 
				sceneModels[1].kAmbi = [ 0.3, 0.0, 0.0 ];
				sceneModels[1].kDiff = [ 0.6, 0.0, 0.0 ];
				sceneModels[1].kSpec = [ 0.8, 0.6, 0.6 ];
				sceneModels[1].nPhong = 32.0;

				break;

			case 10 : 
				sceneModels[1].kAmbi = [ 0.0, 0.0, 0.5 ];
				sceneModels[1].kDiff = [ 0.0, 0.0, 1.0 ];
				sceneModels[1].kSpec = [ 1.0, 1.0, 1.0 ];
				sceneModels[1].nPhong = 125.0;

				break;

			case 11 : 
				sceneModels[1].kAmbi = [ 0.1, 0.1, 0.1 ];
				sceneModels[1].kDiff = [ 0.5, 0.5, 0.5 ];
				sceneModels[1].kSpec = [ 0.7, 0.7, 0.7 ];
				sceneModels[1].nPhong = 1.0;

				break;

		}  	
	}); 

	document.getElementById("cube-button").onclick = function(){
				
		// CUBE
		var pos = -0.5;
		for(var i = 0; i < sceneModels.length; i++ ){
					sceneModels[i]=cubeModel();

					sceneModels[i].tx = pos; sceneModels[i].ty = 0.0;

					sceneModels[i].tz = 0.0;

					sceneModels[i].sx = sceneModels[i].sy = sceneModels[i].sz = 0.25;

					pos+= 1.0;
				}
			
	};      

	document.getElementById("sphere-button").onclick = function(){
				
		// SPHERE
		var pos = -0.5;
		for(var i = 0; i < sceneModels.length; i++ ){
					sceneModels[i]=sphereModel();

					sceneModels[i].tx = pos; sceneModels[i].ty = 0.0;

					sceneModels[i].tz = 0.0;

					sceneModels[i].sx = sceneModels[i].sy = sceneModels[i].sz = 0.25;

					pos+= 1.0;
				}
	};      

	document.getElementById("rectangle-button").onclick = function(){
				
		// RECTANGLE
		var pos = -0.5;
		for(var i = 0; i < sceneModels.length; i++ ){
					sceneModels[i]=cubeModel();

					sceneModels[i].tx = pos; sceneModels[i].ty = 0.0;

					sceneModels[i].tz = 0.0;

					sceneModels[i].sx = 0.35; sceneModels[i].sy = sceneModels[i].sz = 0.25;

					pos+= 1.0;
				}
	};      

	document.getElementById("tetrahedron-button").onclick = function(){
				
		// TETRAHEDRON
		var pos = -0.5;
		for(var i = 0; i < sceneModels.length; i++ ){
					sceneModels[i]=tetrahedronModel();

					sceneModels[i].tx = pos; sceneModels[i].ty = 0.0;

					sceneModels[i].tz = 0.0;

					sceneModels[i].sx = sceneModels[i].sy = sceneModels[i].sz = 0.25;

					pos+= 1.0;
				}
		  	
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
		
		// DEFAULT: Face culling is DISABLED
		
		// Enable FACE CULLING
		
		gl.enable( gl.CULL_FACE );
		
		// DEFAULT: The BACK FACE is culled!!
		
		// The next instruction is not needed...
		
		gl.cullFace( gl.BACK );
		
		// Enable DEPTH-TEST
		
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
	
	setEventListeners(canvas);
	
	tick();		// A timer controls the rendering / animation    

	outputInfos();
}


