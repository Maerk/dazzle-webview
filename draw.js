/*globals*/
var players = new Map(); //map(id_player,struttura_associata)
var first_time = true;
var def_color = "#070d12";
var noplay_color = "#c2c2a3";
var colors_vec = ["#ff0000", "#00ff00", "#0000ff", "#ff33cc", "#ffff00", "#00ccff", "#ff6600", "#ff9999", "#996600", "#660066", "#ccff33", "#009999"];
var colors_index = 0;
var rec_mat = []; //matrice rettangoli
var col_mat = []; //matrice con vettori di colori dei giocatori
var token_num = new Map(); //associa una cella e il numero_token in quella

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
    var val = players.values();
    var it = val.next();
    while(!it.done)
    {
        var subnode = document.createElement("div");
        subnode.appendChild(document.createTextNode(it.value.name + ": " + it.value.points));
        subnode.style = "color: " + it.value.color + ";";
        node.appendChild(subnode);
        it = val.next();
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
                    if(token_num.has(pos))
                    {
                        var n = token_num.get(pos);
                        token_num.set(pos,++n);
                    }
                    else
                        token_num.set(pos,1);
                    rec_mat[i][j] = drawToken(canvas, rec_mat[i][j].pos_x, rec_mat[i][j].pos_y, rec_mat[i][j].width, rec_mat[i][j].height, rec_mat[i][j].color);
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
                rec_mat[i][j] = drawToken(canvas, w*j, h*i, w, h, rec_mat[i][j].color);
            drawPlayer(canvas, j, i);
        }
    }
}
function drawToken(canvas, pos_x, pos_y, width, height, color)
{
    var pos = "";
    pos = pos.concat(pos_y, pos_x);
    var ret = drawRect(canvas, pos_x, pos_y, width, height, color);
    drawRect(canvas, pos_x+width*0.2, pos_y+height*0.2, width*0.6, height*0.6, "#FFFFFF");
    drawText(canvas, token_num.get(pos), pos_x+width*0.2, pos_y+height*0.2+height/2, "#000000");
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
function drawText(canvas, text, pos_x, pos_y, color)
{
    var ctx = canvas.getContext('2d');
    ctx.font = '1px sans-serif';
    ctx.fillStyle = color;
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
    {
        for(var i=0; i<colors_vec.length; i++)
            col = col.concat("#",(parseInt(colors_vec[i].substring(1,colors_vec[i].length-1), 16) - 0x000040).toString(16));
        //col = Math.floor((Math.abs(Math.sin(seed) * 16777215)) % 16777215).toString(16);
        colors_index = 0;
    }
    return col;
}
