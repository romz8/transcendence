export let constants = {
    PAD_SPEED: 10,
    PADDING: 50,
    PITCHWIDTH: 600,
    PITCHHEIGHT: 400,
    PADWIDTH: 10,
    PADHEIGHT: 80,
    BALL_RADIUS: 5,
    BALL_SPEED: 3,
    TOP_BOUNDARY: 50,
    BOTTOM_BOUNDARY: 400 + 50 - 80,
}

export let keyState = {
    'w': false,
    's': false,
    'ArrowUp' : false,
    'ArrowDown' : false,
};

export let initPositions = {
    leftPadX: constants.PADDING + 10,
    leftPadY: constants.PITCHHEIGHT / 2 + constants.PADDING,
    rightPadY: constants.PITCHHEIGHT / 2 + constants.PADDING,
    rightPadX: constants.PITCHWIDTH + constants.PADDING - 10 - 10,
    ballX: constants.PITCHWIDTH / 2 + constants.PADDING,
    ballY: constants.PITCHHEIGHT / 2 + constants.PADDING,
}




