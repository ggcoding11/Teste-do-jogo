class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wave = 1;  // Inicia a primeira onda
    this.maxWaves = 8;  // Número máximo de ondas
    this.waveDuration = 20000;  // Duração de cada onda (30 segundos)
    this.attackCooldown = 1000;  // Tempo mínimo entre ataques (1 segundo)
    this.lastAttackTime = 0;  // Guarda o último tempo de ataque
    this.playerHealth = 100; // HP inicial
    this.maxHealth = 100; // HP máximo
    this.invulnerabilityCooldown = 200; // Agora o tempo entre danos será 0.2 segundos
    this.lastDamageTime = 0; // Guarda o último tempo em que o jogador foi atingido
  }

  preload() {
    //Aqui é onde eu vou loadar as imagens
    this.load.image('fase1_bg', 'assets/fase1.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy1', 'assets/enemy1.png');
    this.load.image('enemy2', 'assets/enemy2.png');
    this.load.image('enemy3', 'assets/enemy3.png');
    this.load.image('rastro', 'assets/rastro.png');
    this.load.audio('musica_fase1', 'assets/musica-fase1.mp3');
  }

  create() {
    console.log("GameScene carregada!"); // Mensagem de teste
    const { width, height } = this.sys.game.config;
    const mapSize = 3000;

    this.fase1Music = this.sound.add('musica_fase1', { loop: true, volume: 0.5 });
    this.fase1Music.play();

    this.add.tileSprite(0, 0, mapSize, mapSize, 'fase1_bg').setOrigin(0);
    this.physics.world.setBounds(0, 0, mapSize, mapSize);
    this.cameras.main.setBounds(0, 0, mapSize, mapSize);

    this.player = this.physics.add.sprite(mapSize / 2, mapSize / 2, 'player')
      .setScale(0.08)
      .setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    //Estabelece o controle pelo W,A,S,D
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');

    this.enemies = this.physics.add.group();

    const phaseText = this.add.text(this.scale.width / 2, this.scale.height - 280, 'Fase 1 - ORGULHO', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setScrollFactor(0);

    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: phaseText,
        alpha: 0, // Faz o texto desaparecer
        duration: 1000, // Suaviza a transição em 1 segundo
        onComplete: () => phaseText.destroy() // Remove o objeto
      });
    });

    this.waveText = this.add.text(width / 2, 16, `Onda: ${this.wave}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0).setScrollFactor(0);

    this.attackRadius = this.add.circle(this.player.x, this.player.y, 150, 0xFF0000, 0); // Opacidade 0 (transparente)
    this.attackRadius.setAlpha(0); // Torna invisível

    this.hpBarBackground = this.add.rectangle(20, 20, 200, 20, 0x444444)
      .setOrigin(0, 0)
      .setScrollFactor(0); // Fixa no canto da tela

    this.hpBar = this.add.rectangle(20, 20, 200, 20, 0xFF0000)
      .setOrigin(0, 0)
      .setScrollFactor(0); // Barra vermelha da vida

    this.hpText = this.add.text(20, 5, `HP: 100%`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0, 0).setScrollFactor(0);

    this.physics.add.overlap(this.player, this.enemies, this.takeDamage, null, this);

    this.startWave();
  }

  updateHPBar() {
    const hpPercentage = Math.floor((this.playerHealth / this.maxHealth) * 100);
    this.hpBar.width = 200 * (hpPercentage / 100); // Ajusta a largura da barra de HP
    this.hpText.setText(`HP: ${hpPercentage}%`); // Atualiza a legenda
  }


  applyDamage(enemy) {
    const damage = Phaser.Math.Between(10, 30);
    enemy.health -= damage;
    this.showFloatingDamage(enemy.x, enemy.y, damage);

    if (enemy.health <= 0) {
      enemy.destroy();
    }

    this.playerHealth -= 5; // O jogador perde vida ao ser atingido
    if (this.playerHealth <= 0) {
      console.log("Game Over!"); // Pode implementar algo para reiniciar
    }

    if (Phaser.Math.Distance.Between(trail.x, trail.y, enemy.x, enemy.y) < 80) { // Raio menor para dano
      this.applyDamage(enemy);
    }

    this.updateHPBar(); // Atualiza a barra de HP
  }

  takeDamage(player, enemy) {
    const now = this.time.now;
    if (now - this.lastDamageTime < this.invulnerabilityCooldown) return;

    const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
    if (dist > 20) return;

    this.lastDamageTime = now;
    this.playerHealth = Math.max(0, this.playerHealth - enemy.damage); // Dano baseado no tipo de inimigo
    this.updateHPBar();

    if (this.playerHealth <= 0) {
      console.log("Game Over!");
    }

    this.tweens.add({
      targets: this.player,
      tint: 0xFF0000,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.player.clearTint();
      }
    });
  }


  startWave() {
    this.waveText.setText(`Onda: ${this.wave}`);

    // Define a duração da onda
    this.waveEndTime = this.time.now + this.waveDuration;

    // Geração contínua de inimigos durante a onda
    this.time.addEvent({
      delay: 1000, // A cada 1 segundo, gera inimigos
      callback: () => {
        if (this.time.now < this.waveEndTime) {
          for (let i = 0; i < 5; i++) { // Gera vários inimigos por vez
            this.spawnEnemyNearby();
          }
        }
      },
      loop: true // Continua executando até o tempo da onda acabar
    });

    // Troca para a próxima onda automaticamente
    this.time.delayedCall(this.waveDuration, () => {
      if (this.wave < this.maxWaves) {
        this.wave++;
        this.startWave();
      } else {
        this.waveText.setText(`Fase concluída!`);
      }
    });
  }

  spawnEnemyNearby() {
    const minDistance = 600; // Distância mínima para spawn (não gera perto do jogador)
    const maxDistance = 1200; // Distância máxima

    let angle = Phaser.Math.FloatBetween(0, Math.PI * 2); // Gera um ângulo aleatório
    let x = this.player.x + Math.cos(angle) * Phaser.Math.Between(minDistance, maxDistance);
    let y = this.player.y + Math.sin(angle) * Phaser.Math.Between(minDistance, maxDistance);

    const enemyStats = {
      enemy1: { health: 250, speed: 130, damage: 10 },
      enemy2: { health: 400, speed: 120, damage: 20 },
      enemy3: { health: 600, speed: 80, damage: 30 }
    };

    const key = Phaser.Math.RND.pick(Object.keys(enemyStats));
    const stats = enemyStats[key];

    const e = this.enemies.create(x, y, key)
      .setScale(this.player.scaleX)
      .setCollideWorldBounds(true);

    e.health = stats.health;
    e.speed = stats.speed;
    e.damage = stats.damage;
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
      .setScale(0.1); // Reduzindo o tamanho do sprite

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
      duration: 250, // Aumentando o tempo para atingir inimigos mais longe
      ease: 'Linear',
      onComplete: () => trail.destroy()
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
      if (dist < 180 && dist < minDist) {
        closest = enemy;
        minDist = dist;
      }
    });

    return closest;
  }

  update() {
    this.attackRadius.setPosition(this.player.x, this.player.y);
    this.checkEnemiesInRange();

    this.updateHPBar();

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

      // Inimigos mais difíceis podem ter comportamento especial
      if (e.damage > 20 && Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 100) {
        e.setTint(0xff0000); // Fica vermelho quando se aproxima, como alerta
      }
    });
  }
}