//console.log("Js working");
const canvas = (document).getElementById("tetris");
const context = canvas.getContext('2d');

context.scale(20,20);

context.fillStyle = '#000';
context.fillRect(0,0, canvas.width, canvas.height);

function arenaSweep(){
    let rowCount = 1;
    outer: for(let y = arena.length-1; y > 0; y--){
        for( let x = 0; x < arena[y].length; x++ ){
            if( arena[y][x] == 0 ){
                continue outer;
            }
        }
        
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        
        ++y;
        
        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

function createArena(widthArena, heightArena){
    const arenaMatrix = [];
    while(heightArena--){
        arenaMatrix.push(new Array(widthArena).fill(0));
    }
    return arenaMatrix;
}

function createPieces(type){
    switch(type){
        case 'T' : return [
            [0,0,0],
            [1,1,1],
            [0,1,0],
        ];
        case 'O' : return [
            [2,2],
            [2,2],
        ];
        case 'L' : return [
            [0,3,0],
            [0,3,0],
            [0,3,3],
        ];
        case 'J' : return [
            [0,4,0],
            [0,4,0],
            [4,4,0] ,
        ];
        case 'I' : return [
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
        ];
        case 'S' : return [
            [0,6,6],
            [6,6,0],
            [0,0,0],
        ];
        case 'Z' : return [
            [7,7,0],
            [0,7,7],
            [0,0,0],
        ];
    }

}

function collide(arena, player){
    const [m, o] = [player.matrix, player.pos];

    for( let y = 0; y < m.length; y++ ){
        for( let x = 0; x < m[y].length; x++ ){
            if( m[y][x] != 0 && ( arena[y + o.y] && arena[y + o.y][x + o.x] ) != 0 ) {
                return true;   
            }
        }
    }
    return false;
}

function draw(){

    context.fillStyle = '#000';
    context.fillRect(0,0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y:0 });
    drawMatrix(player.matrix, player.pos );
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row,y) => {
        row.forEach((value, x) => {
            if( value !== 0 ){
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1,1);
            }
        });
    });
}

function copyPlayerToArena(arena, player){
    player.matrix.forEach(( row, y ) => {
        row.forEach(( value, x ) => {
            if( value != 0 ){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerMove(dir){
    player.pos.x += dir;
    if( collide(arena, player) ){
        player.pos.x -= dir;
    }
}

function playerDrop(){
    player.pos.y++;

    if( collide(arena, player) ) {
        player.pos.y--;
        copyPlayerToArena(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }

    dropCounter = 0;
}

function playerRotate(dir){
    const pos = player.pos.x;
    let offset = 1
    rotate(player.matrix, dir);
    while(collide(arena,player)){
        player.pos.x += offset;
        offset = -( offset + (offset > 0? 1:-1) );
        if( offset > player,matrix[0].length ){
            rotate( player.matrix, -dir );
            player.pos.x = pos;
            player.score = 0;
            return;
        }
    }
}

function rotate(matrix, dir){
    for(let y = 0; y < matrix.length; y++ ){
        for( let x = 0; x < y; x++ ){
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if(dir > 0){
        matrix.forEach(row => row.reverse());
    }else {
        matrix.reverse();
    }
}

let deltaInterval = 1000;
let dropCounter = 0;

let lastTime = 0;

function update(time = 0){
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;

    if( dropCounter > deltaInterval ){
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
    if( event.keyCode === 37 ){
        playerMove(-1);
    } else if( event.keyCode === 39 ){
        playerMove(1);
    } else if( event.keyCode === 40 ){
        playerDrop();
    } else if( event.keyCode=== 81 ){
        playerRotate(-1)
    }else if( event.keyCode=== 87 ){
        playerRotate(1)
    }
});

function playerReset(){
    const pieces = "ILJOTZS";
    player.matrix = createPieces(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length/2 | 0) -                             (player.matrix[0].length / 2 | 0);
    
    if( collide(arena, player) ){
        arena.forEach(row => row.fill(0))
    }
    
}

const colors = [
    null,
    '#2E0927',
    '#D90000',
    '#FF2D00',
    '#AEEE00',
    '#04756F',
    '#FF358B',
]

function updateScore(){
    document.getElementById('score').innerText = player.score; 
}

const arena = createArena(12, 20);

const player = {
    pos: {x:0, y:0},
    matrix: createPieces('L'),
    score: 0
}

update();
updateScore();
playerReset();