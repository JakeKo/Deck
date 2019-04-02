require("jsdom-global")();
global.expect = require("expect");
global.FileReader = window.FileReader;

global.closeEnough = function(a, b, epsilon) {
    return Math.abs(a - b) < epsilon;
}

global.vectorsCloseEnough = function(v1, v2, epsilon) {
    return closeEnough(v1.x, v2.x, epsilon) && closeEnough(v1.y, v2.y, epsilon);
}