class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 1;
    this.maxWaves = 5;
    this.waveDuration = 30000;
    this.attackCooldown = 1000;
    this.lastAttackTime = 0;
  }

  preload() {
    this.load.image('fase1_bg', 'assets/fase1.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy1', 'assets/enemy1.png');
    this.load.image('enemy2', 'assets/enemy2.png');
    this.load.image('enemy3', 'assets/enemy3.png');
    this.load.image('rastro', 'assets/rastro.png');
  }

  create() {
    const { width, height } = this.sys.game.config;
    const mapSize = 3000;

    this.add.tileSprite(0, 0, mapSize, mapSize, 'fase1_bg').setOrigin(0);
    this.physics.world.setBounds(0, 0, mapSize, mapSize);
    this.cameras.main.setBounds(0, 0, mapSize, mapSize);

    this.player = this.physics.add.sprite(mapSize / 2, mapSize / 2, 'player')
      .setScale(0.08)
      .setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.enemies = this.physics.add.group();

    this.waveText = this.add.text(width / 2, 16, `Onda: ${this.wave}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0).setScrollFactor(0);

    this.attackRadius = this.add.circle(this.player.x, this.player.y, 80, 0xFF0000, 0.2);

    this.startWave();
  }

  startWave() {
    this.enemies.clear(true, true);
    this.waveText.setText(`Onda: ${this.wave}`);

    const count = this.wave * 8;
    for (let i = 0; i < count; i++) {
      this.spawnEnemyOutsideView();
    }

    this.time.delayedCall(this.waveDuration, () => {
      if (this.wave < this.maxWaves) {
        this.wave++;
        this.startWave();
      } else {
        this.waveText.setText(`Fase concluída!`);
      }
    });
  }

  spawnEnemyOutsideView() {
    const cam = this.cameras.main;
    const view = cam.worldView;
    const margin = 100;

    let x, y;
    const side = Phaser.Math.Between(0, 3);
    switch (side) {
      case 0: x = view.x - margin; y = Phaser.Math.Between(view.y - margin, view.y + view.height + margin); break;
      case 1: x = view.x + view.width + margin; y = Phaser.Math.Between(view.y - margin, view.y + view.height + margin); break;
      case 2: x = Phaser.Math.Between(view.x - margin, view.x + view.width + margin); y = view.y - margin; break;
      default: x = Phaser.Math.Between(view.x - margin, view.x + view.width + margin); y = view.y + margin;
    }

    const enemyStats = {
      enemy1: { health: 250, speed: 100 },
      enemy2: { health: 400, speed: 80 },
      enemy3: { health: 600, speed: 60 }
    };

    const key = Phaser.Math.RND.pick(Object.keys(enemyStats));
    const stats = enemyStats[key];

    const e = this.enemies.create(x, y, key)
      .setScale(this.player.scaleX)
      .setCollideWorldBounds(true);

    e.health = stats.health;
    e.speed = stats.speed;
  }

  checkEnemiesInRange() {
    const hasEnemyNearby = this.enemies.getChildren().some(enemy => {
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < 150;
    });

    if (hasEnemyNearby) {
      this.attack();
    }
  }

  attack() {
    const now = this.time.now;
    if (now - this.lastAttackTime < this.attackCooldown) return;

    this.lastAttackTime = now;

    const closestEnemy = this.getClosestEnemy();
    if (!closestEnemy) return;

    const trail = this.physics.add.image(this.player.x, this.player.y, 'rastro')
      .setAlpha(0.8)
      .setScale(0.2);

    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, closestEnemy.x, closestEnemy.y);
    trail.setRotation(angle);


    this.physics.add.overlap(trail, this.enemies, (trail, enemy) => {
      this.applyDamage(enemy);
      this.physics.world.removeCollider(trail.body); // Remove colisão, mas mantém o sprite
    });

    this.tweens.add({
      targets: trail,
      x: closestEnemy.x,
      y: closestEnemy.y,
      alpha: 0,
      duration: 200,
      ease: 'Linear',
      onComplete: () => trail.destroy() // Agora o dano ocorre antes da destruição
    });
  }

  applyDamage(enemy) {
    const damage = Phaser.Math.Between(10, 30);
    enemy.health -= damage;
    this.showFloatingDamage(enemy.x, enemy.y, damage);

    if (enemy.health <= 0) {
      enemy.destroy();
    }
  }

  showFloatingDamage(x, y, damage) {
    const dmgText = this.add.text(x, y, `-${damage}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#ff0000',
      stroke: '#000',
      strokeThickness: 3
    });

    this.tweens.add({
      targets: dmgText,
      y: y - 30,
      alpha: 0,
      duration: 800,
      ease: 'Linear',
      onComplete: () => dmgText.destroy()
    });
  }

  getClosestEnemy() {
    let closest = null;
    let minDist = Infinity;

    this.enemies.getChildren().forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (dist < 150 && dist < minDist) {
        closest = enemy;
        minDist = dist;
      }
    });

    return closest;
  }

  update() {
    this.attackRadius.setPosition(this.player.x, this.player.y);
    this.checkEnemiesInRange();

    const speed = 200;
    const dirX = this.cursors.left.isDown || this.keys.A.isDown ? -1
      : this.cursors.right.isDown || this.keys.D.isDown ? 1 : 0;
    const dirY = this.cursors.up.isDown || this.keys.W.isDown ? -1
      : this.cursors.down.isDown || this.keys.S.isDown ? 1 : 0;

    const vecP = new Phaser.Math.Vector2(dirX, dirY).normalize().scale(speed);
    this.player.setVelocity(vecP.x, vecP.y);
    if (dirX < 0) this.player.setFlipX(true);
    else if (dirX > 0) this.player.setFlipX(false);

    this.enemies.getChildren().forEach(e => {
      const vecE = new Phaser.Math.Vector2(this.player.x - e.x, this.player.y - e.y)
        .normalize().scale(e.speed);
      e.setVelocity(vecE.x, vecE.y);
    });
  }
}