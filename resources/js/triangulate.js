class Triangulate extends Page{
    constructor(){
        super();
        this.initVariables();
    }
        
    initVariables(){
        this.polygon;
        this.line;
        this.isLineActive = false;
        this.isButtonClicked = false;
        this.distanceThreshold = 2;
        this.diagonals = [];
        this.graph = [];
    }

    init(){
        resetAll();

        this.initVariables();
        this.initInfo();
        this.initPolygon();
        this.initLine();
    }
    
    initInfo(){
        header1.innerHTML = '<i class="icon fa fa-connectdevelop"></i> triangulation';
        header2.innerHTML = "Polygon Triangulation by Graph Coloring <br> <br><font size=4em> HOW TO: <br> Click anywhere to start creating polygon!";
        step1.innerHTML = "<br><br>STEP 1 | Find Orientation";
        step2.innerHTML = "STEP 2 | Internal Diagonals";
        step3.innerHTML = "STEP 3 | Two Coloring Graph";
    }

    initPolygon(){
        this.polygon = new Polygon();
        scenes[0].add( this.polygon.polygon );
    }
    
    initLine(){
        this.line = new Line();
        scenes[0].add(this.line.line);
    }
    
    updateLine(){
        const lastPoint = this.polygon.getLastPoint();
        this.line.updateLine(lastPoint, input);
        this.line.updateLineMat(lineBasicMaterial_01);
    }
    
    connectPolygon(){
        const firstPoint = this.polygon.getFirstPoint();
        const lastPoint = this.polygon.getLastPoint();
        this.line.updateLine(lastPoint, firstPoint);
        this.line.updateLineMat(lineBasicMaterial_02);
    }
    
    onMouseClick(){
        if(isButtonHovered || this.isButtonClicked || input.distanceTo(this.polygon.getLastPoint()) < this.distanceThreshold)
            return;
    
        this.polygon.addPoint(input);
    
        this.isLineActive = true;
    
        if(this.polygon.getPointCount()>=3)
            ready.style.visibility = 'visible';
    
        var textPos = new THREE.Vector3(input.x, input.y + 10, input.z);
        if(currentPageIndex == 1)
            drawText(letters[this.polygon.getPointCount()-1], textPos, scenes[1], './resources/fonts/Roboto_Regular.json', matLite);
    }
    
    onMouseMove(){
        if(!this.isLineActive || isButtonHovered || this.isButtonClicked)
            return;
        
        this.updateLine();
    }
    
    onEnteredReadyButton(){
        isButtonHovered = true;
    
        if(!this.isLineActive || this.isButtonClicked)
            return;
        
        this.connectPolygon();
    }
    
    onLeftReadyButton(){
        isButtonHovered = false;
    
        if(!this.isLineActive || this.isButtonClicked)
            return;
    
        this.updateLine();
    }
    
    onClickedResetButton(){
        hideSteps();
    
        this.init();
    
        reset.style.visibility = 'hidden';
    }
    
    onEnteredResetButton(){
        isButtonHovered = true;
    }
    
    onLeftResetButton(){
        isButtonHovered = false;
    }

    onClickedReadyButton(){
        this.isButtonClicked = true;
        ready.style.visibility = 'hidden';
        reset.style.visibility = 'visible';
    
        this.cloneScene();
    
        showSteps();
    
        this.triangulate();
    }

    cloneScene(sceneIndices = [1, 2, 3]){
        sceneIndices.forEach( i => {
            scenes[i].add(this.polygon.polygon.clone());
            scenes[i].add(this.line.line.clone());
        });
    }
    
    triangulate(){
        this.findDiagonals();
    
        this.twoColorGraph(scenes[3]);
    }
    
    findDiagonals(){
        this.findConvexHull();
    
        var orientation = this.findOrientation();
    
        for(var i=0; i<this.polygon.getPointCount(); i++){
            var startIndex = i*3;
            var startPoint = this.polygon.getPoint(startIndex);

            var trio = this.polygon.getTrio(startIndex, orientation);
    
            for(var j=i+2; j<this.polygon.getPointCount(); j++){
                var endIndex = j*3;
                var endPoint = this.polygon.getPoint(endIndex);
    
                if(isSamePoint(trio.a, endPoint) || isSamePoint(trio.c, endPoint))
                    continue;
    
                var diagonal = new THREE.Line3(startPoint, endPoint);
                
                drawLine(diagonal, scenes[1]);
    
                if(this.polygon.isIntersecting(diagonal))
                    continue;

                if(this.polygon.isInCone(startIndex, diagonal)){
                    this.diagonals.push(diagonal);
                    drawLine(diagonal, scenes[2]);
                }
            }
        }
    
        info2.innerHTML += `
        Approach: A potential diagonal of the polygon have two features: having both ends internal and not intersecting with an edge. For all diagonals below steps are performed.
        <br/> <br/> <b>Convex or Reflex?</b>
        The angle is marked as reflex if it's sign is negative and convex otherwise. 
        <br/> <br/> <b>Is Internal?</b>
        Assuming the angle is convex and polygon is oriented counter-clockwise, point's left neighbor point should be on diagonal's left side and it's right neighbor should be on diagonal's right.
        <br/> <br/> <b>Intersecting with Edges?</b>
        If the diagonal is found to be internal, it should now be checked to see if it intersects with any of the edges of the polygon.
        `;
    }
    
    findConvexHull(){
        
        info1.innerHTML += `Approach: When traveling on a <b>counter-clockwise oriented simple polygon</b>one always has the curve interior to the left.
        <br/> <br/> Therefore the orientation of a simple polygon is related to the <b>sign of the angle</b> at any vertex of the convex hull of the polygon.
        <br/> <br/> Using this fact rigthmost vertex is found and orientation is calculated.
        <br/> <br/> `;
    
        info1.innerHTML += "Rightmost Vertex: " + letters[this.polygon.getConvexHullIndex() / 3] + "<br/>";
    }
    
    findOrientation(){
        const orientation = this.polygon.getOrientation();
        if(orientation)
            info1.innerHTML += "Orientation: Counter Clockwise <br/>";
        else
            info1.innerHTML += "Orientation: Clockwise <br/>";
    
        info1.innerHTML += "Time Complexity: O(n) <br/>";
    
        return orientation;
    }
    
    createGraph(){
        for(var i=0; i<this.diagonals.length; i++) this.graph.push([]);
    
        for(var i=0; i<this.diagonals.length; i++){
            for(var j=i+1; j<this.diagonals.length; j++){
                if(isIntersecting(this.diagonals[i], this.diagonals[j])){
                    this.graph[i].push(j);
                    this.graph[j].push(i);
                }
            }
        }
    }
    
    twoColorGraph(scene){
        this.createGraph();
    
        var coloredIndices = [];
        for(var i=0; i<this.graph.length; i++) coloredIndices.push(0);
        var coloredNodeCount = 0;
        while(coloredNodeCount < this.graph.length){
            for(var i=0; i<this.graph.length; i++){
                if(coloredIndices[i]!=0)
                    continue;
                
                drawLine(this.diagonals[i], scene);
                coloredIndices[i] = 1;
                coloredNodeCount++;
    
                for(var j=0;j<this.graph[i].length; j++){
                    coloredIndices[this.graph[i][j]] = 1;
                    coloredNodeCount++;
                }
            }
        }
    
        info3.innerHTML += `After finding all diagonals that are internal and not crossing any edge,
        the graph is constructed which for each <b>diagonal</b> of the polygon, there is a corresponding <b>node</b> in the graph
        and for <b>every pair of intersecting diagonals</b>, there is an <b>edge</b> between the corresponding graph nodes.
        An adjacency matrix is used to represent the graph where a key keeps an index of a diagonal and it's
        value is the list of indices of diagonals that it intersects with.
        <br><br>Steps to two-color graph:
        <br> Randomly choose an uncolored node, u
        <br> Color u as <b>white</b>
        <br> Color all neighbors of u as <b>black</b>
        <br> Repeat until all nodes are colored
        <br><br> White nodes are now our triangulation!`;
    }
}
