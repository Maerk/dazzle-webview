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
