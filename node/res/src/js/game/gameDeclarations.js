export let constants = {
    PAD_SPEED: 5,
    PITCHWIDTH: 800,
    PITCHHEIGHT: 400,
    PADWIDTH: 10,
    PADHEIGHT: 75,
    BALL_RADIUS: 5,
    BALL_SPEED: 3,
    TOP_BOUNDARY: 0,
    BOTTOM_BOUNDARY: 325,
}

export let keyState = {
    'w': false,
    's': false,
    'ArrowUp' : false,
    'ArrowDown' : false,
};

export let initPositions = {
    leftPadX: 0,
    leftPadY: constants.PITCHHEIGHT / 2 - constants.PADHEIGHT / 2,
    rightPadX: 790,
    rightPadY: constants.PITCHHEIGHT / 2 - constants.PADHEIGHT / 2,
    ballX: constants.PITCHWIDTH / 2,
    ballY: constants.PITCHHEIGHT / 2,
}