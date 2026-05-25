import Phaser from 'phaser';

export default class SideScrollerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SideScrollerScene' });
  }

  preload() {
    console.log('Preload started');
    // Load your ground texture
    this.load.image('ground', 'assets/African_Street_Ground.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('house', 'assets/recording_studio_house.png'); // Load the house texture

    this.load.on('complete', () => {
      console.log('Assets loaded successfully');
    });
  }

  create() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const groundHeight = 209; // Height of the African_Street_Ground.png

    // 1) ADD THE HOUSE TEXTURE AS A BACKGROUND
    // Place it at a fixed location in the scene
    this.house = this.add.image(200, gameHeight - groundHeight - 150, 'house'); // Adjust coordinates as needed
    this.house.setOrigin(0.5, 1); // Anchor the bottom-center of the house at (200, y-position)
    this.house.setScale(0.8); // Scale it down if needed to fit the scene

    // 2) CREATE A TILESPRITE FOR THE GROUND
    this.ground = this.add.tileSprite(
      0,                  // x
      gameHeight,         // y (bottom of the screen)
      gameWidth,          // fill horizontal
      groundHeight,       // tileSprite height
      'ground'
    ).setOrigin(0, 1);

    // 3) MAKE THE GROUND A STATIC PHYSICS BODY
    this.physics.add.existing(this.ground, true);
    this.ground.body.setSize(gameWidth, 10).setOffset(0, 30);

    // 4) CREATE THE PLAYER
    this.player = this.physics.add.sprite(
      gameWidth / 2,          // centered horizontally
      gameHeight - 214,       // so feet land on the collision line
      'player'
    );
    this.player.setDisplaySize(70, 70);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);

    // Collide the player with the ground
    this.physics.add.collider(this.player, this.ground);

    // 5) SET UP INPUT
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // The player stays fixed at x = gameWidth / 2.
    // We scroll the ground tile instead to simulate running.

    const scrollSpeed = 5;

    if (this.cursors.left.isDown) {
      this.ground.tilePositionX -= scrollSpeed;
    } else if (this.cursors.right.isDown) {
      this.ground.tilePositionX += scrollSpeed;
    }

    // Jump if on the ground
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-300); // Tweak jump power as needed
    }
  }
}

