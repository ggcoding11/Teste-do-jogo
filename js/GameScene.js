class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('fase1_bg', 'assets/fase1.png');
    this.load.image('player',    'assets/player.png');
  }

  create() {
    // 1) Tamanho do mapa
    const mapWidth  = 3000;
    const mapHeight = 3000;

    // 2) TileSprite -> repete a textura pelo mapa inteiro
    this.background = this.add
      .tileSprite(0, 0, mapWidth, mapHeight, 'fase1_bg')
      .setOrigin(0);

    // 3) Define limites do mundo físico e da câmera
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(  0,   0, mapWidth, mapHeight);

    // 4) Posição inicial do player (centro do mapa)
    this.player = this.physics.add
      .sprite(mapWidth/2, mapHeight/2, 'player')
      .setScale(0.08)
      .setCollideWorldBounds(true);

    // 5) Faz a câmera seguir o player
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1);

    // 6) Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys    = this.input.keyboard.addKeys('W,A,S,D');
  }

  update() {
    const speed = 200;
    const dirX = this.cursors.left.isDown || this.keys.A.isDown
      ? -1
      : this.cursors.right.isDown || this.keys.D.isDown
      ?  1
      :  0;
    const dirY = this.cursors.up.isDown   || this.keys.W.isDown
      ? -1
      : this.cursors.down.isDown || this.keys.S.isDown
      ?  1
      :  0;

    const vec = new Phaser.Math.Vector2(dirX, dirY)
      .normalize()
      .scale(speed);

    this.player.setVelocity(vec.x, vec.y);

    if (dirX < 0)      this.player.setFlipX(true);
    else if (dirX > 0) this.player.setFlipX(false);
  }
}
