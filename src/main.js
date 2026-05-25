
import SideScrollerScene from './scenes/Street.js';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [SideScrollerScene],
    physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: true,
        },
    },          
};

export default new Phaser.Game(config);
