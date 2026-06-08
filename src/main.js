
import Phaser from 'phaser';

import PocketBotWorkshop from './scenes/PocketBotWorkshop.js';
import SideScrollerScene from './scenes/Street.js';
import { getInitialGameSize } from './ui/gameViewport.js';

const gameSize = getInitialGameSize(window);

const config = {
    type: Phaser.AUTO,
    width: gameSize.width,
    height: gameSize.height,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [PocketBotWorkshop, SideScrollerScene],
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: true,
        },
    },          
};

export default new Phaser.Game(config);
