
import Phaser from 'phaser';

import { createSceneList, isV2DecisionSceneRequested } from './game/sceneSelection.js';
import PocketBotWorkshop from './scenes/PocketBotWorkshop.js';
import PocketBotWorkshopV2 from './scenes/PocketBotWorkshopV2.js';
import SideScrollerScene from './scenes/Street.js';
import { getInitialGameSize } from './ui/gameViewport.js';

const gameSize = getInitialGameSize(window);
const scene = createSceneList({
    useV2: isV2DecisionSceneRequested(window.location.search),
    PocketBotWorkshop,
    PocketBotWorkshopV2,
    SideScrollerScene,
});

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
    scene,
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: true,
        },
    },          
};

export default new Phaser.Game(config);
