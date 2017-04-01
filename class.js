/*class*/
function Player(name, points, position_point, color)
{
    this.name = name;
    this.points = points;
    this.pos_x = position_point.x;
    this.pos_y = position_point.y;
    this.color = color; //il colore della striscia
}
function Rectangle(color, pos_x, pos_y, width, height)
{
    this.color = color;
    this.pos_x = pos_x;
    this.pos_y = pos_y;
    this.width = width;
    this.height = height;
}
