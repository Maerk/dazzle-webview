/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*events*/
window.onload = function()
{
    var canvas = document.getElementById("myCan");
    canvas.width = window.innerWidth/2;
    canvas.height = window.innerHeight/2;
    createInputBox();
};
window.onresize = function()
{
    var canvas = document.getElementById("myCan");
    canvas.width = window.innerWidth/2;
    canvas.height = window.innerHeight/2;
    if(!first_time)
    {
        drawGridFromMat(canvas);
    }
};
