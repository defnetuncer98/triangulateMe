var currentPageIndex = 1;

var pages = [];

init();

function init(){
    initPages();
    initListeners();
    pages[currentPageIndex].init();
}

function initPages(){
    var home = new Home();
    pages.push(home);
    var triangulate = new Triangulate();
    pages.push(triangulate);
}

function getInputOnScreen( event ){
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    input.x = mouse.x - window.innerWidth/2;
    input.y = -mouse.y + window.innerHeight/2;
}

function updateCursor(){
    cursor.style.top = mouse.y + 'px';
    cursor.style.left = mouse.x + 'px';
}

function initListeners(){
    //window.addEventListener( 'resize', onWindowResize, false );
    window.addEventListener( 'click', onDocumentMouseClick, false );
    window.addEventListener( 'mousemove', onDocumentMouseMove, false );

    for (var i = 0; i < navbuttons.length; i++){
        navbuttons[i].addEventListener('mouseenter', mouseEnteredNavButton, false);
        navbuttons[i].addEventListener('mouseleave', mouseLeftNavButton, false);
    }

    page1button.addEventListener('click', function(){changePage(0)}, false);
    page2button.addEventListener('click', function(){changePage(1)}, false);
    page3button.addEventListener('click', function(){changePage(2)}, false);
    page4button.addEventListener('click', function(){changePage(3)}, false);
}

function changePage(pageIndex){
    pages[pageIndex]();
    currentPageIndex = pageIndex;
}

function mouseEnteredNavButton(){
    isButtonHovered = true;
}

function mouseLeftNavButton(){
    isButtonHovered = false;
}

function onDocumentMouseClick( event ) {
    getInputOnScreen(event);

    pages[currentPageIndex].onMouseClick();
}

function onDocumentMouseMove( event ) {
    getInputOnScreen(event);

    updateCursor();

    pages[currentPageIndex].onMouseMove();
}

function onClickedReadyButton(){
    pages[currentPageIndex].onClickedReadyButton();
}

function onLeftReadyButton(){
    pages[currentPageIndex].onLeftReadyButton();
}

function onEnteredReadyButton(){
    pages[currentPageIndex].onEnteredReadyButton();
}

function onClickedResetButton(){
    pages[currentPageIndex].onClickedResetButton();
}

function onLeftResetButton(){
    pages[currentPageIndex].onLeftResetButton();
}

function onEnteredResetButton(){
    pages[currentPageIndex].onEnteredResetButton();
}
