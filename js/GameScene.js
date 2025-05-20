class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 1;
    this.maxWaves = 5;         // total de fases regulares antes do boss
    this.waveDuration = 30000; // duração de cada onda em ms (30s)
  }

  preload() {
    this.load.image('fase1_bg', 'assets/fase1.png');
    this.load.image('player',    'assets/player.png');
    this.load.image('enemy1',    'assets/enemy1.png');
    this.load.image('enemy2',    'assets/enemy2.png');
    this.load.image('enemy3',    'assets/enemy3.png');
  }

  create() {
    const { width, height } = this.sys.game.config;
    const mapSize = 3000;

    // fundo expansível
    this.add
      .tileSprite(0, 0, mapSize, mapSize, 'fase1_bg')
      .setOrigin(0);

    // limites do mundo e da câmera
    this.physics.world.setBounds(0, 0, mapSize, mapSize);
    this.cameras.main.setBounds(0, 0, mapSize, mapSize);

    // jogador
    this.player = this.physics.add
      .sprite(mapSize/2, mapSize/2, 'player')
      .setScale(0.08)
      .setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys    = this.input.keyboard.addKeys('W,A,S,D');

    // grupo de inimigos
    this.enemies = this.physics.add.group();

    // texto de onda
    this.waveText = this.add.text(width/2, 16, `Onda: ${this.wave}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0).setScrollFactor(0);

    // inicia primeira onda
    this.startWave();
  }

  startWave() {
    // limpa inimigos antigos
    this.enemies.clear(true, true);

    // atualiza texto de onda
    this.waveText.setText(`Onda: ${this.wave}`);

    // calcula quantos inimigos spawnar nesta onda
    const count = this.wave * 8; // ex: 8,16,24...
    for (let i = 0; i < count; i++) {
      this.spawnEnemyOutsideView();
    }

    // programa próxima onda após duração
    this.time.delayedCall(this.waveDuration, () => {
      if (this.wave < this.maxWaves) {
        this.wave++;
        this.startWave();
      } else {
        // onda final antes do boss
        this.waveText.setText(`Fase concluída!`);
        // aqui você pode chamar a cena do boss
      }
    });
  }

  spawnEnemyOutsideView() {
    const cam   = this.cameras.main;
    const view  = cam.worldView;
    const margin = 100;

    let x, y;
    const side = Phaser.Math.Between(0, 3);
    switch (side) {
      case 0: // esquerda
        x = view.x - margin;
        y = Phaser.Math.Between(view.y - margin, view.y + view.height + margin);
        break;
      case 1: // direita
        x = view.x + view.width + margin;
        y = Phaser.Math.Between(view.y - margin, view.y + view.height + margin);
        break;
      case 2: // topo
        x = Phaser.Math.Between(view.x - margin, view.x + view.width + margin);
        y = view.y - margin;
        break;
      default: // baixo
        x = Phaser.Math.Between(view.x - margin, view.x + view.width + margin);
        y = view.y + view.height + margin;
    }

    const key   = Phaser.Math.RND.pick(['enemy1', 'enemy2', 'enemy3']);
    const speed = Phaser.Math.Between(30, 120); // velocidades variadas

    // cria inimigo
    const e = this.enemies.create(x, y, key)
      .setScale(this.player.scaleX)
      .setCollideWorldBounds(true);
    e.speed = speed;
  }

  update() {
    // --- Movimento do Player ---
    const speed = 200;
    const dirX = this.cursors.left.isDown || this.keys.A.isDown ? -1
               : this.cursors.right.isDown || this.keys.D.isDown ?  1
               : 0;
    const dirY = this.cursors.up.isDown   || this.keys.W.isDown ? -1
               : this.cursors.down.isDown || this.keys.S.isDown ?  1
               : 0;

    const vecP = new Phaser.Math.Vector2(dirX, dirY)
      .normalize()
      .scale(speed);
    this.player.setVelocity(vecP.x, vecP.y);
    if (dirX < 0)      this.player.setFlipX(true);
    else if (dirX > 0) this.player.setFlipX(false);

    // --- Inimigos perseguem o player ---
    this.enemies.getChildren().forEach(e => {
      const vecE = new Phaser.Math.Vector2(
        this.player.x - e.x,
        this.player.y - e.y
      ).normalize().scale(e.speed);
      e.setVelocity(vecE.x, vecE.y);
    });
  }
}
