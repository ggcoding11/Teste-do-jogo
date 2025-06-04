class FaseSecretaBossScene extends Phaser.Scene {
  constructor() {
    super("FaseSecretaBossScene");

    this.upgrades = [
      {
        name: "Mais Dano",
        effect: () => {
          this.damageBonus += 15;
          this.bowDamage += 15;
          this.staffDamage += 15;
        },
      },
      {
        name: "Velocidade de Ataque",
        effect: () => {
          this.attackCooldown *= 0.8;
          this.bowCooldown *= 0.8;
          this.staffCooldown *= 0.8;
        },
      },
      { name: "Vida Máxima Aumentada", effect: () => (this.maxHealth += 20) },
      { name: "Regeneração de HP", effect: () => (this.regenHP += 0.5) },
      { name: "Velocidade Aumentada", effect: () => (this.playerSpeed += 40) },
    ];
  }

  init() {
    this.secondaryWeapon = null;
    this.passiveFireTimer = null;
    this.isInvulnerable = false;
    this.attackCooldown = 1500;
    this.lastAttackTime = 0;
    this.playerHealth = 100;
    this.maxHealth = 100;
    this.invulnerabilityCooldown = 200;
    this.lastDamageTime = 0;

    this.shieldCooldown = 6000;
    this.lastShieldTime = -Infinity;

    this.staffDamage = 25;
    this.staffCooldown = 1700;
    this.bowDamage = 80;
    this.bowCooldown = 1200;

    this.playerXP = 0;
    this.level = 1;
    this.xpToNextLevel = 100;

    this.damageBonus = 0;
    this.playerSpeed = 200;
    this.regenHP = 0;
    this.isGameOver = false;

    this.isPaused = false;
  }

  preload() {
    this.load.image("fase1_bg", "assets/fase1.png");
    this.load.image("player", "assets/player.png");
    this.load.image("miniboss1", "assets/miniboss1.png");
    this.load.image("rastro", "assets/rastro.png");
    this.load.audio("sfxCut", "assets/sfx-corte.mp3");
    this.load.audio("morte1", "assets/morte1.mp3");
    this.load.audio("levelUp", "assets/level-up.mp3");
    this.load.audio("musica_fase1", "assets/musica-fase1.mp3");
    this.load.image("arrow", "assets/arrow.png");
    this.load.image("staffProj", "assets/staff_proj.png");
    this.load.image("icon_bow", "assets/icon_bow.png");
    this.load.image("icon_staff", "assets/icon_staff.png");
    this.load.image("icon_shield", "assets/icon_shield.png");
    this.load.image("hugo_boss", "assets/hugo_boss.png");
    this.load.image("bossProj", "assets/boss_proj.png");
  }

  setRandomBossDirection() {
  if (!this.boss || this.isGameOver) return;

  const angle = Phaser.Math.Between(0, 359); 
  const velocity = this.physics.velocityFromAngle(angle, this.bossSpeed);
  this.boss.body.setVelocity(velocity.x, velocity.y);
  }

  create() {
    const { width, height } = this.sys.game.config;
    const mapWidth = this.scale.width;
    const mapHeight = this.scale.height;

    this.fase1Music = this.sound.add("musica_fase1", {
      loop: true,
      volume: 0.5,
    });
    this.fase1Music.play();

    this.add.image(mapWidth / 2, mapHeight / 2, "fase1_bg").setDisplaySize(mapWidth, mapHeight);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    this.player = this.physics.add
      .sprite(mapWidth / 2, mapHeight / 2, "player")
      .setScale(0.065)
      .setCollideWorldBounds(true);
    //this.cameras.main.startFollow(this.player, true, 0.1, 0.1); //remover o movimento da camera

    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    this.enemies = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.shieldKey = this.input.keyboard.addKey("E");

    this.pauseText = this.add
      .text(width / 2, height / 2, "PAUSADO", {
        fontFamily: '"Press Start 2P"',
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setVisible(false);

    this.pauseKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // Cria o boss no centro do mapa
    this.boss = this.physics.add
    .sprite(this.player.x + 100, this.player.y, "hugo_boss")
    .setScale(0.3)
    .setCollideWorldBounds(true)
    .setBounce(1); // rebote nas bordas

    // Grupo para projéteis do boss
    this.bossProjectiles = this.physics.add.group();
    this.meteorProjectiles = this.physics.add.group(); //grupo exclusivo

    // Timer de ataque do boss
    /*this.time.addEvent({
    delay: 2000,
    loop: true,
    callback: this.bossAttack,
    callbackScope: this,
    });*/

    // Sequência de ataque lateral (esquerda → direita)
    this.time.addEvent({
      delay: 6000,
      loop: true,
      callback: this.executarSequenciaAtaqueLateral,
      callbackScope: this,
    });

    // Timer ataque meteoro
    this.time.addEvent({
      delay: 15000,
      loop: true,
      callback: this.executarAtaqueMeteoro,
      callbackScope: this,
    });

    this.iconHUD = this.add
    .image(this.scale.width - 20, 20, "icon_shield")
    .setOrigin(1, 0)
    .setScrollFactor(0)
    .setScale(0.1)
    .setDepth(1000);

    this.miniBossProjectiles = this.physics.add.group();

    const tituloFase = this.add
      .text(width / 2, height - 280, "Fase Secreta", {
        fontFamily: '"Press Start 2P"',
        fontSize: "20px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

      this.time.delayedCall(2000, () => {
      tituloFase.destroy();
      });

    this.createHUD();

    this.physics.add.overlap(
      this.player,
      this.bossProjectiles,
      (player, proj) => {
        this.takeDamage(proj.damage);
        proj.destroy();
      },
      null,
      this
    );

    this.secondaryWeapon = "shield";
    this.iconHUD.setTexture("icon_shield");

    this.bossSpeed = 100; // velocidade do boss
    this.setRandomBossDirection();

    this.time.addEvent({
      delay: 3000,
      callback: this.setRandomBossDirection,
      callbackScope: this,
      loop: true
    });
  }

  showGameOverScreen() {
    if (this.isGameOver) return;
    this.isGameOver = true;

    // para toda a física
    this.physics.world.pause();
    // --> pausa também TODOS os timers, incluindo o de tiroteio

    this.time.paused = true;
    this.input.keyboard.enabled = false;

    const { width, height } = this.scale;
    // overlay
    this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setOrigin(0.5)
      .setScrollFactor(0);
    // texto
    this.add
      .text(width / 2, height / 2 - 50, "GAME OVER", {
        fontFamily: '"Press Start 2P"',
        fontSize: "40px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    // botão Reiniciar
    const btn = this.add
      .text(width / 2, height / 2 + 50, "Reiniciar", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive();

    btn.on("pointerdown", () => {
      this.isGameOver = false;
      this.time.paused = false;
      this.physics.world.resume();
      this.input.keyboard.enabled = true;
      if (this.fase1Music) this.fase1Music.stop();
      this.scene.restart();
    });

    const menuBtn = this.add
      .text(width / 2, height / 2 + 100, "Voltar ao Menu", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.7)",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000)
      .setInteractive();

    menuBtn.on("pointerdown", () => {
      if (this.fase1Music) this.fase1Music.stop();
      this.scene.start("TitleScene"); // vai para a cena de título
    });

    this.physics.world.pause();
    this.input.keyboard.enabled = false;
  }

  createHUD() {
    const width = this.scale.width;

    this.hpBarBackground = this.add
      .rectangle(20, 20, 200, 20, 0x444444)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000);
    this.hpBar = this.add
      .rectangle(20, 20, 200, 20, 0xff0000)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000);
    this.hpText = this.add
      .text(20, 5, `HP: 100%`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000);

    this.xpBarBackground = this.add
      .rectangle(20, 60, 200, 10, 0x444444)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000);
    this.xpBar = this.add
      .rectangle(20, 60, 200, 10, 0x00ff00)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000);
    this.xpText = this.add
      .text(20, 45, `XP: 0/${this.xpToNextLevel}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1000);

    this.levelText = this.add
      .text(20, 75, `Level: ${this.level}`, {
        fontFamily: '"Press Start 2P"',
        fontSize: "16px",
        color: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  avisarEDispararProjeteis(linhasY, direcao = "esquerda") {
    const width = this.scale.width;

    linhasY.forEach((y) => {
      const aviso = this.add.rectangle(width / 2, y, width, 5, 0xff0000)
        .setOrigin(0.5)
        .setAlpha(0.7);

      this.tweens.add({
        targets: aviso,
        alpha: 0,
        yoyo: true,
        repeat: 4,
        duration: 75,
        onComplete: () => {
          aviso.destroy();

          const xInicial = direcao === "esquerda" ? -50 : width + 50;
          const velX = direcao === "esquerda" ? 600 : -600;

          const proj = this.bossProjectiles.create(xInicial, y, "bossProj");
          proj.setVelocityX(velX);
          proj.setScale(0.2);
          proj.damage = 15;

          this.time.delayedCall(4000, () => {
            if (proj.active) proj.destroy();
          });
        },
      });
    });
  }

  //---------------------------------------------ataques do boss---------------------------------------------

  //ataque lateral esquerda -> direita

  dispararAtaqueLateral() {
    const width = this.scale.width;
    const height = this.scale.height;

    const linhasY = [25, height / 2, height - 25];

    // Para cada linha (topo, meio, fundo)
    linhasY.forEach((y) => {
      // 1. Cria um aviso (linha vermelha piscando)
      const aviso = this.add.rectangle(width / 2, y, width, 5, 0xff0000)
        .setOrigin(0.5)
        .setAlpha(0.7);

      // 2. Pisca e depois dispara o projétil
      this.tweens.add({
        targets: aviso,
        alpha: 0,
        yoyo: true,
        repeat: 4,
        duration: 75,
        onComplete: () => {
          aviso.destroy();

          // 3. Cria projétil na borda esquerda
          const proj = this.bossProjectiles.create(-50, y, "bossProj");
          proj.setVelocityX(400); // velocidade para a direita
          proj.setScale(0.2);
          proj.damage = 15;

          // Destroi se sair da tela
          this.time.delayedCall(4000, () => {
            if (proj.active) proj.destroy();
          });
        },
      });
    });
  }

  //ataque lateral direita -> esquerda

  executarSequenciaAtaqueLateral() {
    const width = this.scale.width;
    const height = this.scale.height;

    const topo = 25;
    const meio = height / 2;
    const fundo = height - 25;
    const topoMeio = (topo + meio) / 2;
    const meioFundo = (meio + fundo) / 2;

    const inverter = Phaser.Math.Between(0, 1) === 1; // 50% de chance

    if (!inverter) {
      // Padrão original: 3 da esquerda, 2 da direita
      this.avisarEDispararProjeteis([topo, meio, fundo], "esquerda");
      this.time.delayedCall(1000, () => {
        this.avisarEDispararProjeteis([topoMeio, meioFundo], "direita");
      });
    } else {
      // Padrão invertido: 3 da direita, 2 da esquerda
      this.avisarEDispararProjeteis([topo, meio, fundo], "direita");
      this.time.delayedCall(1000, () => {
        this.avisarEDispararProjeteis([topoMeio, meioFundo], "esquerda");
      });
    }
  }

  executarAtaqueMeteoro() {
    const width = this.scale.width;
    const height = this.scale.height;
    const numProjeteis = 10;
    const delayEntreProjeteis = 300;

    for (let i = 0; i < numProjeteis; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(100, height - 100);

      // Define o tempo para cada projétil individualmente
      this.time.delayedCall(i * delayEntreProjeteis, () => {
        // Aviso circular no chão
        const aviso = this.add.circle(x, y, 80, 0xff0000, 0.5)
          .setDepth(999)
          .setAlpha(0.7);

        this.tweens.add({
          targets: aviso,
          alpha: 0,
          yoyo: true,
          repeat: 2,
          duration: 100,
        });

        // Após o aviso, faz o projétil cair
        this.time.delayedCall(500, () => {
          aviso.destroy();

          const proj = this.meteorProjectiles.create(x, -50, "bossProj");
          proj.setScale(0.15);
          proj.setVelocityY(600);

          const impactoY = y;

          // Quando atinge a área, explode
          this.time.delayedCall(800, () => {
            if (proj.active) {
              proj.destroy();

              const area = this.add.circle(x, impactoY, 80);
              this.physics.add.existing(area);
              area.body.setAllowGravity(false);
              area.body.setCircle(80);
              area.body.setOffset(-80, -80);
              area.damage = 30;

              this.physics.add.overlap(this.player, area, () => {
                this.takeDamage(area.damage);
                area.destroy(); // Para não tomar dano repetido
              }, null, this);

              this.time.delayedCall(300, () => {
                if (area && area.destroy) area.destroy();
              });
            }
          });
        });
      });
    }
  }

  /*bossAttack() {
    if (!this.boss || this.isGameOver) return;

    // Cria projétil na posição do boss
    const proj = this.bossProjectiles.create(this.boss.x, this.boss.y, "bossProj");
    proj.setScale(0.1);
    proj.setVelocity(Phaser.Math.Between(-200, -100), Phaser.Math.Between(-50, 50));
    proj.damage = 10;

    // Destroi projétil após 4 segundos
    this.time.delayedCall(4000, () => {
        if (proj.active) proj.destroy();
    });

    if (this.playerHealth <= 0) {
      this.showGameOverScreen();
    }
  }*/

  //------------------------------------------------------------------------------------------

  //verificação de dano
  takeDamage(amount) {
    if (this.isInvulnerable || this.isGameOver) return;

    if (typeof this.playerHealth !== "number" || isNaN(this.playerHealth)) {
      this.playerHealth = this.maxHealth; // Reset ou fallback seguro
    }

    const now = this.time.now;
    if (now - this.lastDamageTime < this.invulnerabilityCooldown) return;

    this.lastDamageTime = now;
    this.playerHealth = Math.max(0, this.playerHealth - amount);
    this.updateHPBar();

    if (this.playerHealth <= 0) {
      this.showGameOverScreen();
    }

    this.tweens.add({
      targets: this.player,
      tint: 0xff0000,
      duration: 100,
      yoyo: true,
      onComplete: () => this.player.clearTint(),
    });
  }


  update(time, delta) {
    const hpRatio = Phaser.Math.Clamp(this.playerHealth / this.maxHealth, 0, 1);
    this.hpBar.width = 200 * hpRatio;

    if (
        Phaser.Input.Keyboard.JustDown(this.shieldKey) &&
        this.secondaryWeapon === "shield" &&
        !this.isInvulnerable &&
        time - this.lastShieldTime >= this.shieldCooldown
    ) {
        this.activateShield();
    }

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      if (!this.isPaused) {
        // pause everything but keep Esc listener alive
        this.physics.world.pause();
        this.time.paused = true;
        this.pauseText.setVisible(true);
        this.isPaused = true;
      } else {
        // resume
        this.physics.world.resume();
        this.time.paused = false;
        this.pauseText.setVisible(false);
        this.isPaused = false;
      }
      return; // skip the rest of update() in this frame
    }

    if (this.physics.world.isPaused || this.isPaused || this.isGameOver) {
      return;
    }

    if (
      !this.physics.world.isPaused &&
      this.regenHP > 0 &&
      this.playerHealth < this.maxHealth
    ) {
      this.playerHealth = Math.min(
        this.maxHealth,
        this.playerHealth + (this.regenHP * this.game.loop.delta) / 1000
      );
    }

    // Movimento do jogador (WASD)
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

    if (this.playerHealth <= 0 && !this.isGameOver) {
      this.showGameOverScreen();
      return;
    }
  }

  activateShield() {
    if (this.isInvulnerable) return;

    // 1) Ativa o escudo visualmente e funcionalmente
    this.isInvulnerable = true;
    this.iconHUD.setAlpha(0.5);
    this.player.setTint(0x00ffff);

    // 2) Depois de 1.5s, desativa o escudo
    this.time.delayedCall(1500, () => {
        this.isInvulnerable = false;
        this.player.clearTint();

        // Marca o tempo do fim do escudo para iniciar cooldown
        this.lastShieldTime = this.time.now;

        // 3) Após o cooldown, restaura o ícone HUD
        this.time.delayedCall(this.shieldCooldown, () => {
        this.iconHUD.setAlpha(1);
        });
    });
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
    this.level++;
    this.playerXP = 0;
    this.xpToNextLevel += Math.floor(100 * Math.pow(1.2, this.level - 1));
    this.levelText.setText(`Level: ${this.level}`);
  }
}
