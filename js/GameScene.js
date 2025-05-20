class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 1;
    this.maxWaves = 5;
    this.waveDuration = 30000;
    this.attackCooldown = 1000;
    this.lastAttackTime = 0;
    this.playerHealth = 100; // Vida inicial do jogador
  }

  create() {
    const { width } = this.sys.game.config;

    // Barra de vida
    this.healthBarBg = this.add.rectangle(width / 2, 30, 200, 20, 0x555555).setOrigin(0.5);
    this.healthBar = this.add.rectangle(width / 2, 30, 200, 20, 0xff0000).setOrigin(0.5);
    
    this.player = this.physics.add.sprite(1500, 1500, 'player').setScale(0.08).setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    this.enemies = this.physics.add.group();

    this.physics.add.overlap(this.player, this.enemies, this.enemyHitPlayer, null, this);
    
    this.startWave();
  }

  enemyHitPlayer(player, enemy) {
    this.playerHealth -= 10; // Dano do inimigo
    this.updateHealthBar();
    
    if (this.playerHealth <= 0) {
      this.player.setTint(0xff0000); // Efeito de "morte"
      this.physics.pause();
      this.add.text(player.x, player.y, "Você perdeu!", { fontSize: '24px', color: '#fff' }).setOrigin(0.5);
    }
  }

  updateHealthBar() {
    const percent = Phaser.Math.Clamp(this.playerHealth / 100, 0, 1);
    this.healthBar.width = 200 * percent;
  }
}