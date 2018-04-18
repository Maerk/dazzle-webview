/* This Source Code Form is subject to the terms of the Mozilla Public
* License, v. 2.0. If a copy of the MPL was not distributed with this
* file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*globals*/
var players = new Map(); //map(id_player,struttura_associata)
var first_time = true;
var def_color = "#070d12";
var noplay_color = "#c2c2a3";
var colors_vec = [
        "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
        "#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
        "#5A0007", "#809693", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80", "#012C58",
        "#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
        "#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
        "#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
        "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
        "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",
        "#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
        "#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
        "#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
        "#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
        "#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C",
        "#83AB58", "#001C1E", "#D1F7CE", "#004B28", "#C8D0F6", "#A3A489", "#806C66", "#222800",
        "#BF5650", "#E83000", "#66796D", "#DA007C", "#FF1A59", "#8ADBB4", "#1E0200", "#5B4E51",
        "#C895C5", "#320033", "#FF6832", "#66E1D3", "#CFCDAC", "#D0AC94", "#7ED379" ];
var colors_index = 0;
var rec_mat = []; //matrice rettangoli
var col_mat = []; //matrice con vettori di colori dei giocatori
var token_num = new Map(); //associa una cella e il numero_token in quella (sono sempre 1)

/*functions*/
function createInputBox()
{
    var node = document.getElementById("inputBox");
    while (node.hasChildNodes())
        node.removeChild(node.firstChild);
    var cont1 = document.createElement("div");
    cont1.className = "container";
    var cont2 = document.createElement("div");
    cont2.className = "container";
    var txt1 = document.createElement("input");
    txt1.type = "text";
    txt1.placeholder = "IP";
    txt1.id = "ip";
    var txt2 = document.createElement("input");
    txt2.type = "text";
    txt2.placeholder = "PORT";
    txt2.id = "port";
    var but = document.createElement("input");
    but.type = "submit";
    but.value = "GO";
    but.addEventListener("click", function(){connect();});

    cont1.appendChild(txt1);
    cont1.appendChild(txt2);
    cont2.appendChild(but);
    node.appendChild(cont1);
    node.appendChild(cont2);
}
function destroyInputBox()
{
    var node = document.getElementById("inputBox");
    while (node.hasChildNodes())
        node.removeChild(node.firstChild);
    var but = document.createElement("input");
    but.type = "button";
    but.value = "EXIT";
    but.addEventListener("click", function(){disconnect();});
    node.appendChild(but);
}
function drawPoints()
{
    var node = document.getElementById("points");
    while (node.hasChildNodes())
        node.removeChild(node.firstChild);
    var val = players.values();
    var it = val.next();
    var arr_points = [];
    while(!it.done)
    {
        var obj = {points:it.value.points, name:it.value.name, color:it.value.color};
        arr_points.push(obj);
        it = val.next();
    }
    arr_points.sort(function(a, b) {return b.points - a.points;});
    for(var i=0; i<arr_points.length; i++)
    {
        var subnode = document.createElement("div");
        subnode.appendChild(document.createTextNode(arr_points[i].name + ": " + arr_points[i].points));
        subnode.style = "color: " + arr_points[i].color + ";";
        node.appendChild(subnode);
    }
}
function drawTime(turns_left, ms_turn)
{
    var tempo = (turns_left * ms_turn / 1000).toFixed(2);
    document.getElementById("time").appendChild(document.createTextNode("Time: "+tempo));
}
function drawMatrix(matrix, tokens)
{
    token_num.clear();
    var canvas = document.getElementById("myCan");

    for(var i=0; i<matrix.length; i++)
    {
        for(var j=0; j<matrix[i].length; j++)
        {
            //disegna campo e scia
            var good_color = def_color;
            if(matrix[i][j] !== null)
            {
                if(players.has(matrix[i][j]))
                    good_color = players.get(matrix[i][j]).color;
                else
                    good_color = noplay_color;
            }
            rec_mat[i][j] = drawRect(canvas, rec_mat[i][j].pos_x, rec_mat[i][j].pos_y, rec_mat[i][j].width, rec_mat[i][j].height, good_color);

            //disegna i token
            var pos = "";
            pos = pos.concat(i,j);
            for(var k=0; k<tokens.length; k++)
            {
                if(tokens[k].x == j && tokens[k].y == i)
                {
                   /*if(token_num.has(pos))
                    {
                        var n = token_num.get(pos);
                        token_num.set(pos,++n);
                    }
                    else*/
                        token_num.set(pos,1);
                    rec_mat[i][j] = drawToken(canvas, rec_mat[i][j].pos_x, rec_mat[i][j].pos_y, rec_mat[i][j].width, rec_mat[i][j].height, rec_mat[i][j].color, pos);
                }
            }
            //disegna players
            drawPlayer(canvas, j, i);
        }
    }
}
function destroyMatrix()
{
    //svuota tutto
    var canv = document.getElementById("myCan");
    var par = canv.parentNode;
    par.removeChild(canv);
    canv = document.createElement("canvas");
    canv.width = window.innerWidth/2;
    canv.height = window.innerHeight/2;
    canv.className = "canv border";
    canv.id = "myCan";
    par.appendChild(canv);

    players.clear();
    first_time = true;
    colors_index = 0;
    rec_mat = [];
    col_mat = [];
}
function destroyTime()
{
    var node = document.getElementById("time");
    while (node.hasChildNodes())
        node.removeChild(node.firstChild);
}
function destroyPoints()
{
    var node = document.getElementById("points");
    while (node.hasChildNodes())
        node.removeChild(node.firstChild);
}
function drawGridInit(canvas, num_col, num_row, matrix)
{
    var w = canvas.width/num_col;
    var h = canvas.height/num_row;
    for(var k=0; k<num_row; k++)
    {
        var rec = [];
        for(var i=0; i< num_col; i++)
        {
            rec.push(drawRect(canvas, w*i, h*k, w, h, def_color));
        }
        matrix.push(rec);
    }
}
function drawGridFromMat(canvas)
{
    var w = canvas.width/rec_mat[0].length;
    for(var i=0; i<rec_mat.length; i++)
    {
        var h = canvas.height/rec_mat.length;
        for(var j=0; j<rec_mat[i].length; j++)
        {
            var pos = "";
            pos = pos.concat(i,j);
            if(!token_num.has(pos))
                rec_mat[i][j] = drawRect(canvas, w*j, h*i, w, h, rec_mat[i][j].color);
            else
                rec_mat[i][j] = drawToken(canvas, w*j, h*i, w, h, rec_mat[i][j].color, pos);
            drawPlayer(canvas, j, i);
        }
    }
}
function drawToken(canvas, pos_x, pos_y, width, height, color, pos)
{
    var ret = drawRect(canvas, pos_x, pos_y, width, height, color);
    drawRect(canvas, pos_x+width*0.2, pos_y+height*0.2, width*0.6, height*0.6, "#FFFFFF");
    drawText(canvas, "T", pos_x+width*0.35, pos_y+height*0.7, height*0.5, "#000000");
    return ret;
}
function drawPlayer(canvas, pos_x, pos_y)
{
    if(col_mat[pos_y][pos_x].length>0)
    {
        var rad = rec_mat[pos_y][pos_x].height < rec_mat[pos_y][pos_x].width ? rec_mat[pos_y][pos_x].height/2 : rec_mat[pos_y][pos_x].width/2;
        drawCircle(canvas, rec_mat[pos_y][pos_x].pos_x+rec_mat[pos_y][pos_x].width/2, rec_mat[pos_y][pos_x].pos_y+rec_mat[pos_y][pos_x].height/2, rad, col_mat[pos_y][pos_x]);
    }
}
function drawRect(canvas, pos_x, pos_y, width, height, fill_color)
{
    var ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle="#FFFFFF";
    ctx.lineWidth = 3;
    ctx.strokeRect(pos_x,pos_y,width,height);
    ctx.fillStyle=fill_color;
    ctx.fillRect(pos_x,pos_y,width,height);
    var rec = new Rectangle(fill_color, pos_x, pos_y, width, height);
    return rec;
}
function drawCircle(canvas, pos_x, pos_y, radius, colors_arr)
{
    /*pos centro e raggio rispetto a rect, array di colori lungo numero di
    giocatori che sono nella stessa posizione,
    si splitta il cerchio*/
    var dim = 2*Math.PI/colors_arr.length;
    radius /= 2;
    for(var i=0; i<colors_arr.length; i++)
    {
        var ctx=canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(pos_x,pos_y,radius,dim*i,dim*(i+1));
        ctx.moveTo(pos_x,pos_y);
        ctx.lineTo(Math.cos(dim*i)*radius+pos_x,Math.sin(dim*i)*radius+pos_y);
        ctx.lineTo(Math.cos(dim*(i+1))*radius+pos_x,Math.sin(dim*(i+1))*radius+pos_y);
        ctx.lineTo(pos_x, pos_y);
        ctx.fillStyle=colors_arr[i];
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos_x,pos_y,radius,0,2*Math.PI);
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
function drawText(canvas, text, pos_x, pos_y, pixels, color)
{
    var ctx = canvas.getContext('2d');
    ctx.font = (pixels+'px sans-serif');
    ctx.fillStyle = color;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, pos_x, pos_y);
}
function assignColor()
{
    var col = "";
    if(colors_index < colors_vec.length)
    {
        col = colors_vec[colors_index];
        colors_index++;
    }
    else
        colors_index = 0;
    return col;
}
