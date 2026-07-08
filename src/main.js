
import Phaser from 'phaser';
import { GridEngine } from 'grid-engine';

import {
    createSceneList,
    isV2DecisionSceneRequested,
    isV2WorldSceneRequested,
} from './game/sceneSelection.js';
import PocketBotWorkshop from './scenes/PocketBotWorkshop.js';
import PocketBotTrainingWorld from './scenes/PocketBotTrainingWorld.js';
import PocketBotWorkshopV2 from './scenes/PocketBotWorkshopV2.js';
import SideScrollerScene from './scenes/Street.js';
import { getInitialGameSize } from './ui/gameViewport.js';

const gameSize = getInitialGameSize(window);
const scene = createSceneList({
    useV2: isV2DecisionSceneRequested(window.location.search),
    useV2World: isV2WorldSceneRequested(window.location.search),
    PocketBotWorkshop,
    PocketBotTrainingWorld,
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
    plugins: {
        scene: [
            {
                key: 'gridEngine',
                plugin: GridEngine,
                mapping: 'gridEngine',
            },
        ],
    },
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: true,
        },
    },          
};

export default new Phaser.Game(config);
