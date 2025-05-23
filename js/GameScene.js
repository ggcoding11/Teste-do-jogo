class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");

    // configurações que não mudam entre reinícios
    this.upgrades = [
      { name: "Mais Dano", effect: () => (this.damageBonus += 15) },
      { name: "Velocidade de Ataque", effect: () => (this.attackCooldown *= 0.8) },
      { name: "Vida Máxima Aumentada", effect: () => (this.maxHealth += 20) },
      { name: "Regeneração de HP", effect: () => (this.regenHP += 0.5) },
      { name: "Velocidade Aumentada", effect: () => (this.playerSpeed += 40) },
    ];
  }

  // chamado sempre que a cena inicia ou reinicia
  init() {
    this.wave = 1;
    this.maxWaves = 10;
    this.waveDuration = 20000;
    this.attackCooldown = 1500;
    this.lastAttackTime = 0;
    this.playerHealth = 100;
    this.maxHealth = 100;
    this.invulnerabilityCooldown = 200;
    this.lastDamageTime = 0;

    this.playerXP = 0;
    this.level = 1;
    this.xpToNextLevel = 100;

    this.damageBonus = 0;
    this.playerSpeed = 200;
    this.regenHP = 0;
    this.isGameOver = false;

    // === MINI-BOSS FLAGS ===
    this.miniBossSpawned = false;     // só uma vez na onda 5
    this.miniBossProjectiles = null;  // criado em create()
  }

  preload() {
    this.load.image("fase1_bg", "assets/fase1.png");
    this.load.image("player", "assets/player.png");
    this.load.image("enemy1", "assets/enemy1.png");
    this.load.image("enemy2", "assets/enemy2.png");
    this.load.image("enemy3", "assets/enemy3.png");
    this.load.image("rastro", "assets/rastro.png");
    this.load.audio("sfxCut", "assets/sfx-corte.mp3");
    this.load.audio("morte1", "assets/morte1.mp3");
    this.load.audio("morte2", "assets/morte2.mp3");
    this.load.audio("morte3", "assets/morte3.mp3");
    this.load.audio("morte4", "assets/morte4.mp3");
    this.load.audio("morte5", "assets/morte5.mp3");
    this.load.audio("morte6", "assets/morte6.mp3");
    this.load.audio("morte7", "assets/morte7.mp3");
    this.load.image("projetil", "assets/projetil.png");
    this.load.audio("musica_fase1", "assets/musica-fase1.mp3");
  }

  create() {
    // reativa controles e física após reinício

    this.time.paused = false;
    this.input.keyboard.enabled = true;
    this.physics.world.resume();

    this.sfxCut = this.sound.add("sfxCut", { volume: 0.5 });

    this.morteSounds = [
      this.sound.add("morte1", { volume: 0.2 }),
      this.sound.add("morte2", { volume: 0.2 }),
      this.sound.add("morte3", { volume: 0.2 }),
      this.sound.add("morte4", { volume: 0.2 }),
      this.sound.add("morte5", { volume: 0.2 }),
      this.sound.add("morte6", { volume: 0.2 }),
      this.sound.add("morte7", { volume: 0.2 })
    ];

    const { width, height } = this.sys.game.config;
    const mapSize = 3000;

    // música de fundo
    this.fase1Music = this.sound.add("musica_fase1", { loop: true, volume: 0.5 });
    this.fase1Music.play();

    // cenário e limites
    this.add.tileSprite(0, 0, mapSize, mapSize, "fase1_bg").setOrigin(0);
    this.physics.world.setBounds(0, 0, mapSize, mapSize);
    this.cameras.main.setBounds(0, 0, mapSize, mapSize);

    // jogador
    this.player = this.physics.add
      .sprite(mapSize / 2, mapSize / 2, "player")
      .setScale(0.08)
      .setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // controles WASD
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    // grupo de inimigos
    this.enemies = this.physics.add.group();

    this.miniBossProjectiles = this.physics.add.group();

    // texto de fase
    const phaseText = this.add
      .text(width / 2, height - 280, "Fase 1 - Luxúria", {
        fontFamily: '"Press Start 2P"',
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 20, y: 10 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: phaseText,
        alpha: 0,
        duration: 1000,
        onComplete: () => phaseText.destroy()
      });
    });

    // HUD: onda
    this.waveText = this.add
      .text(width / 2, 16, `Onda: ${this.wave}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.5)",
        padding: { x: 10, y: 5 }
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(1000);

    // HUD: HP
    this.hpBarBackground = this.add.rectangle(20, 20, 200, 20, 0x444444).setOrigin(0).setScrollFactor(0).setDepth(1000);
    this.hpBar = this.add.rectangle(20, 20, 200, 20, 0xff0000).setOrigin(0).setScrollFactor(0).setDepth(1000);
    this.hpText = this.add.text(20, 5, `HP: 100%`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0).setScrollFactor(0).setDepth(1000);

    // HUD: XP
    this.xpBarBackground = this.add.rectangle(20, 60, 200, 10, 0x444444).setOrigin(0).setScrollFactor(0).setDepth(1000);
    this.xpBar = this.add.rectangle(20, 60, 200, 10, 0x00ff00).setOrigin(0).setScrollFactor(0).setDepth(1000);
    this.xpText = this.add.text(20, 45, `XP: 0/${this.xpToNextLevel}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#ffffff"
    }).setOrigin(0).setScrollFactor(0).setDepth(1000);

    // HUD: Level
    this.levelText = this.add.text(20, 75, `Level: ${this.level}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#ffffff"
    }).setScrollFactor(0).setDepth(1000);

    this.updateHPBar();
    this.updateXPBar();

    // overlap jogador ↔ inimigos
    this.physics.add.overlap(this.player, this.enemies, this.takeDamage, null, this);

    this.physics.add.overlap(
      this.player,
      this.miniBossProjectiles,
      (player, proj) => {
        // dano de projétil
        const now = this.time.now;
        if (now - this.lastDamageTime < this.invulnerabilityCooldown) return;
        this.lastDamageTime = now;

        this.playerHealth = Math.max(0, this.playerHealth - proj.damage);
        this.updateHPBar();
        proj.destroy();

        if (this.playerHealth <= 0) {
          this.showGameOverScreen();
        }
      },
      null,
      this
    );

    // começa as ondas de inimigos
    this.startWave();
  }

  updateHPBar() {
    const pct = Math.floor((this.playerHealth / this.maxHealth) * 100);
    this.hpBar.width = 200 * (pct / 100);
    this.hpText.setText(`HP: ${pct}%`);
  }

  updateXPBar() {
    const prog = this.playerXP / this.xpToNextLevel;
    this.xpBar.width = 200 * prog;
    this.xpText.setText(`XP: ${this.playerXP}/${this.xpToNextLevel}`);
  }

  ganharXP(qtd) {
    this.playerXP += qtd;
    if (this.playerXP >= this.xpToNextLevel) {
      this.subirDeNivel();
    }
    this.updateXPBar();
  }

  subirDeNivel() {
    if (this.isGameOver) {
      // se já estamos em Game Over, aborta o upgrade
      return;
    }

    this.level++;
    this.playerXP = 0;
    this.xpToNextLevel += Math.floor(100 * Math.pow(1.2, this.level - 1));

    this.physics.world.pause();
    this.time.paused = true;
    this.input.keyboard.enabled = false;

    const choices = Phaser.Utils.Array.Shuffle(this.upgrades.slice()).slice(0, 3);
    this.showUpgradeOptions(choices);
    this.levelText.setText(`Level: ${this.level}`);
  }

  showUpgradeOptions(choices) {
    const menu = this.add.group();
    choices.forEach((upg, i) => {
      const opt = this.add
        .text(this.scale.width / 2, 150 + i * 50, upg.name, {
          fontFamily: '"Press Start 2P"',
          fontSize: "20px",
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setInteractive();

      opt.on("pointerdown", () => {
        upg.effect();
        menu.destroy(true);
        this.physics.world.resume();
        this.time.paused = false;
        this.input.keyboard.enabled = true;

        this.keys.W.reset();
        this.keys.A.reset();
        this.keys.S.reset();
        this.keys.D.reset();

        // opcionalmente zera a velocidade imediata do player
        this.player.setVelocity(0, 0);
      });

      menu.add(opt);
    });
  }

  takeDamage(player, enemy) {
    const now = this.time.now;
    if (now - this.lastDamageTime < this.invulnerabilityCooldown) return;
    const d = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
    if (d > 20) return;

    this.lastDamageTime = now;
    this.playerHealth = Math.max(0, this.playerHealth - enemy.damage);
    this.updateHPBar();

    if (this.playerHealth <= 0) {
      this.showGameOverScreen();
    }

    this.tweens.add({
      targets: this.player,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      onComplete: () => this.player.clearTint()
    });
  }

  showGameOverScreen() {
    this.isGameOver = true;

    // para toda a física
    this.physics.world.pause();
    // --> pausa também TODOS os timers, incluindo o de tiroteio

    this.time.paused = true;
    this.input.keyboard.enabled = false;

    const { width, height } = this.scale;
    // overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setOrigin(0.5).setScrollFactor(0);
    // texto
    this.add.text(width / 2, height / 2 - 50, "GAME OVER", {
      fontFamily: '"Press Start 2P"',
      fontSize: "40px",
      color: "#ffffff"
    }).setOrigin(0.5).setScrollFactor(0);
    // botão Reiniciar
    const btn = this.add.text(width / 2, height / 2 + 50, "Reiniciar", {
      fontFamily: '"Press Start 2P"',
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive();

    btn.on("pointerdown", () => {
      if (this.fase1Music) this.fase1Music.stop();
      this.scene.restart(); // dispara init()+preload()+create()
    });

    const menuBtn = this.add
      .text(width / 2, height / 2 + 100, "Voltar ao Menu", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 20, y: 10 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    menuBtn.on("pointerdown", () => {
      if (this.fase1Music) this.fase1Music.stop();
      this.scene.start("TitleScene");  // vai para a cena de título
    });

    this.physics.world.pause();
    this.input.keyboard.enabled = false;
  }

  startWave() {
    this.waveText.setText(`Onda: ${this.wave}`);
    this.waveEndTime = this.time.now + this.waveDuration;

    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        if (this.time.now < this.waveEndTime) {
          // 1) sempre 3 inimigos normais
          for (let i = 0; i < 3; i++) {
            this.spawnEnemyNearby();
          }

          // 2) na onda 5, também spawnar mini-boss *uma vez*
          if (this.wave === 8 && !this.miniBossSpawned) {
            this.spawnMiniBoss();
            this.miniBossSpawned = true;
          }
        }
      }
    });

    this.time.delayedCall(this.waveDuration, () => {
      if (this.wave < this.maxWaves) {
        this.wave++;
        this.startWave();
      } else {
        this.waveText.setText("Fase concluída!");
      }
    });
  }

  spawnEnemyNearby() {
    const minD = 600, maxD = 1200;
    const ang = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const x = this.player.x + Math.cos(ang) * Phaser.Math.Between(minD, maxD);
    const y = this.player.y + Math.sin(ang) * Phaser.Math.Between(minD, maxD);

    const statsMap = {
      enemy1: { health: 250, speed: 130, damage: 10 },
      enemy2: { health: 400, speed: 120, damage: 20 },
      enemy3: { health: 600, speed: 80, damage: 30 },
    };
    const key = Phaser.Math.RND.pick(Object.keys(statsMap));
    const base = statsMap[key];

    // fator de escala linear: +10% de força a cada onda
    const linearScale = 1 + (this.wave - 1) * 0.1;

    // opcional: escala exponencial (+10% por onda de forma acumulativa)
    // const expoScale  = Math.pow(1.1, this.wave - 1);

    const enemyHealth = Math.floor(base.health * linearScale);
    const enemyDamage = Math.floor(base.damage * linearScale);

    const e = this.enemies.create(x, y, key)
      .setScale(this.player.scaleX)
      .setCollideWorldBounds(true);

    e.health = enemyHealth;
    e.speed = base.speed;      // mantém velocidade fixa, ou escale se quiser
    e.damage = enemyDamage;
  }

  spawnMiniBoss() {
    const ang = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const dist = Phaser.Math.Between(800, 1200);
    const x = this.player.x + Math.cos(ang) * dist;
    const y = this.player.y + Math.sin(ang) * dist;

    // basear em enemy1, só maior e mais forte
    this.miniBoss = this.enemies.create(x, y, "enemy1")
      .setScale(this.player.scaleX * 2)
      .setCollideWorldBounds(true);

    this.miniBoss.health = 8000;  // vida aumentada
    this.miniBoss.speed = 160;   // ligeiramente mais rápido
    this.miniBoss.damage = 30;    // contato, se quiser

    this.miniBoss.setTint(0xffaa00);

    // timer para atirar a cada 1.5s
    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => this.bossShoot(this.miniBoss)
    });
  }

  // === novo método ===
  bossShoot(boss) {

    if (!boss.active || this.isGameOver) return;

    // 1) Cria o projétil sem escala ainda
    const proj = this.miniBossProjectiles.create(boss.x, boss.y, "projetil");

    // 2) Define um tamanho bem menor (ex: 20% do original)
    proj.setScale(0.1);

    // e reajusta a hitbox
    proj.body.setSize(proj.displayWidth, proj.displayHeight);
    proj.body.setOffset(
      (proj.width - proj.displayWidth) / 2,
      (proj.height - proj.displayHeight) / 2
    );

    // 4) Dá dano menor, se quiser
    proj.damage = 20;

    // 5) Velocidade em direção ao jogador
    const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
    this.physics.velocityFromRotation(angle, 300, proj.body.velocity);

    // 6) Faz o projétil “morrer” ao sair do mundo
    proj.setCollideWorldBounds(true);
    proj.body.onWorldBounds = true;
    proj.body.world.on("worldbounds", body => {
      if (body.gameObject === proj) proj.destroy();
    });
  }

  checkEnemiesInRange() {
    if (this.enemies.getChildren().some(e =>
      Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 150
    )) this.attack();
  }

  attack() {
    const now = this.time.now;
    if (now - this.lastAttackTime < this.attackCooldown) return;
    this.lastAttackTime = now;

    const tgt = this.getClosestEnemy();
    if (!tgt) return;

    const trail = this.physics.add.image(this.player.x, this.player.y, "rastro")
      .setAlpha(0.8).setScale(0.1)
      .setRotation(Phaser.Math.Angle.Between(
        this.player.x, this.player.y, tgt.x, tgt.y
      ));

    this.sfxCut.play();

    this.physics.add.overlap(trail, this.enemies, (t, enemy) => {
      this.applyDamage(enemy);
      this.physics.world.removeCollider(t.body);
    });

    this.tweens.add({
      targets: trail,
      x: tgt.x,
      y: tgt.y,
      alpha: 0,
      duration: 250,
      ease: "Linear",
      onComplete: () => trail.destroy()
    });
  }

  applyDamage(enemy) {
    const dmg = Phaser.Math.Between(10, 30) + this.damageBonus;
    enemy.health -= dmg;
    this.showFloatingDamage(enemy.x, enemy.y, dmg);
    if (enemy.health <= 0) {
      const sfx = Phaser.Math.RND.pick(this.morteSounds);
      sfx.play();
      enemy.destroy();
      this.ganharXP(10 + this.wave * 2);
    }
  }

  showFloatingDamage(x, y, damage) {
    const txt = this.add.text(x, y, `-${damage}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#ff0000",
      stroke: "#000",
      strokeThickness: 3,
    });
    this.tweens.add({
      targets: txt,
      y: y - 30,
      alpha: 0,
      duration: 800,
      ease: "Linear",
      onComplete: () => txt.destroy()
    });
  }

  getClosestEnemy() {
    let closest = null, minD = Infinity;
    this.enemies.getChildren().forEach(e => {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < 180 && d < minD) {
        closest = e;
        minD = d;
      }
    });
    return closest;
  }

  update() {

    if (this.physics.world.isPaused) {
      return;
    }

    this.checkEnemiesInRange();
    this.updateHPBar();

    if (!this.physics.world.isPaused && this.regenHP > 0 && this.playerHealth < this.maxHealth) {
      this.playerHealth = Math.min(
        this.maxHealth,
        this.playerHealth + (this.regenHP * this.game.loop.delta) / 1000
      );
    }

    const dirX = this.keys.A.isDown ? -1 : this.keys.D.isDown ? 1 : 0;
    const dirY = this.keys.W.isDown ? -1 : this.keys.S.isDown ? 1 : 0;

    if (dirX !== 0 || dirY !== 0) {
      const vec = new Phaser.Math.Vector2(dirX, dirY)
        .normalize()
        .scale(this.playerSpeed);
      this.player.setVelocity(vec.x, vec.y);
      this.player.setFlipX(vec.x < 0);
    } else {
      this.player.setVelocity(0, 0);
    }


    this.enemies.getChildren().forEach(e => {
      const chase = new Phaser.Math.Vector2(
        this.player.x - e.x,
        this.player.y - e.y
      ).normalize().scale(e.speed);
      e.setVelocity(chase.x, chase.y);
      if (e.damage > 20 &&
        Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < 100
      ) {
        e.setTint(0xff0000);
      }
    });
  }
}
