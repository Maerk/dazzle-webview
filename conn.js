//{ "players": [ { "name": "lollete", "points": 420, "position": { "x": 1,"y": 0},"id": 321 },{ "name": "lollo", "points": 426, "position": { "x": 1,"y": 0},"id": 322 },{ "name": "nino", "points": 26, "position": { "x": 1,"y": 0},"id": 323 }],"grid": [[ null, null,null,null ], [ 321, null,null,321 ],[ null, null,null,null ],[ null, null,null,null ],[ null, null,null,null ],[ null, null,null,null ],[ null, null,null,null ],[ null, 322,null,null ],[ null, 322,null,321 ]], "turns_left": 4, "ms_for_turn": 100, "tokens": [{ "x": 1,"y": 1 },{"x": 1, "y": 2}]}

/*globals*/
var socket;

/*functions*/
function disconnect()
{
    socket.close();
    destroyPoints();
    destroyTime();
    destroyMatrix();
    createInputBox();
}
function connect()
{
    var ip = document.getElementById("ip").value;
    var port = document.getElementById("port").value;
    destroyInputBox();
    // Create WebSocket connection.
    socket = new WebSocket("ws://" + ip + ":" + port);
    // Connection opened
    socket.addEventListener('open', function (event) {
        socket.send('Hello Server!');
    });
    // Listen for messages
    socket.addEventListener('message', function (event) {
        parseData(event.data);
    });
    socket.addEventListener('close', function (event) {
        disconnect();
    });
    /*socket.addEventListener('error', function (event) {
        manageError(event.data);
    });*/
}
function parseData(data_json)
{
    var data_obj;
    try
    {
        data_obj = JSON.parse(data_json);
    }
    catch(e)
    {
        alert(e + "\nDISCONNECTED...");
        disconnect();
        return;
    }

    //init col_mat or clean
    for(var i=0; i<data_obj.grid.length; i++)
    {
        if(first_time)
            col_mat[i] = [];
        for(var j=0; j<data_obj.grid[i].length; j++)
        {
            if(first_time)
                col_mat[i][j] = [];
            else
                col_mat[i][j] = []; // clean col_mat
        }
    }
    for(i=0; i<data_obj.players.length; i++)
    {
        var color;
        if(first_time)
        {
            color = assignColor();
            var stat = new Player(data_obj.players[i].name, data_obj.players[i].points, data_obj.players[i].position, color);
            players.set(data_obj.players[i].id, stat);
        }
        else
        {
            //modifica posizione
            var obj = players.get(data_obj.players[i].id);
            obj.pos_x = data_obj.players[i].position.x;
            obj.pos_y = data_obj.players[i].position.y;
            obj.points = data_obj.players[i].points;
            color = obj.color;
            players.set(data_obj.players[i].id, obj);
        }
        //scrivi i colori
        col_mat[data_obj.players[i].position.y][data_obj.players[i].position.x].push(color);
    }
    if(first_time)
    {
        //riempio rec_mat
        drawGridInit(document.getElementById("myCan"), data_obj.grid[0].length, data_obj.grid.length, rec_mat);
        first_time = false;
    }

    drawMatrix(data_obj.grid, data_obj.tokens);
    destroyTime();
    destroyPoints();
    drawTime(data_obj.turns_left, data_obj.ms_for_turn);
    drawPoints();
}
