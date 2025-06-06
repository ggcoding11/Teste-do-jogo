class FaseSecretaBossScene extends Phaser.Scene {
  constructor() {
    super("FaseSecretaBossScene");

    this.upgrades = [
      {
        name: "Mais Dano",
        effect: () => {
          this.damageBonus += 15;
        },
      },
      {
        name: "Velocidade de Ataque",
        effect: () => {
          this.attackCooldown *= 0.8;
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
    this.tornadoCooldown = 5000;
    this.lastTornadoTime = -Infinity;


    this.playerXP = 0;
    this.level = 1;
    this.xpToNextLevel = 100;

    this.damageBonus = 0;
    this.playerSpeed = 200;
    this.regenHP = 0;
    this.isGameOver = false;

    this.bossMaxHealth = 150000;
    this.bossHealth = this.bossMaxHealth;

    this.isPaused = false;
  }

  preload() {
    this.load.image("chao", "assets/chão.png");
    this.load.image("player", "assets/player.png");
    this.load.image("rastro", "assets/rastro.png");
    this.load.audio("sfxCut", "assets/sfx-corte.mp3");
    this.load.audio("morte1", "assets/morte1.mp3");
    this.load.audio("levelUp", "assets/level-up.mp3");
    this.load.audio("musica_fase1", "assets/musica-fase1.mp3");
    this.load.image("icon_shield", "assets/icon_shield.png");
    this.load.image("hugo_boss", "assets/hugo_boss.png");
    this.load.image("bossProj", "assets/boss_proj.png");
    this.load.image("escorpiao", "assets/escorpião.png");
    this.load.image("prova", "assets/prova.png");
    this.load.image("zip", "assets/zip.png");
    this.load.image("tornado1", "assets/tornado1.png");
    this.load.image("tornado2", "assets/tornado2.png");
    this.load.image("tornado3", "assets/tornado3.png");
    this.load.image("tornado4", "assets/tornado4.png");
    this.load.image("icon_tornado", "assets/icon_tornado.png");
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

    this.chaoTile = this.add.tileSprite(0, 0, mapWidth, mapHeight, "chao")
      .setOrigin(0) // importante para alinhar no topo-esquerdo
      .setTileScale(0.25);
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

    /*this.mostrarDialogoBoss([
      "Você ousa desafiar o mestre deste lugar?",
      "Eu sou Hugo, o verdadeiro guardião da fase secreta.",
      "Prepare-se para ser destruído!"
    ]);*/

    this.player = this.physics.add
      .sprite(mapWidth / 2, mapHeight / 2, "player")
      .setScale(0.065)
      .setCollideWorldBounds(true)
      .setDepth(999);
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
    .setScale(0.1)
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

    // Timer ataque em leque
    this.time.addEvent({
      delay: 10000,
      loop: true,
      callback: this.executarAtaqueLeque,
      callbackScope: this,
    });

    // Define armas ativas
    this.secondaryWeapon = "shield"; // (mantém se necessário)

    // Ícone do escudo (canto superior direito)
    this.shieldIcon = this.add
      .image(this.scale.width - 20, 20, "icon_shield")
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setScale(0.1)
      .setDepth(1000);

    // Ícone do tornado (ao lado do escudo)
    this.tornadoIcon = this.add
      .image(this.scale.width - 60, 20, "icon_tornado")
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setScale(0.1)
      .setDepth(1000);

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

    this.anims.create({
      key: "tornado_spin",
      frames: [
        { key: "tornado1" },
        { key: "tornado2" },
        { key: "tornado3" },
        { key: "tornado4" },
      ],
      frameRate: 10,
      repeat: -1,
    });

    this.tornadoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE); // tecla de ativação = barra de espaço

    this.bossSpeed = 100;
    this.setRandomBossDirection();

    const barWidth = 500;
    const barHeight = 20;

    // Borda preta (atrás de tudo)
    this.bossHPBorder = this.add.rectangle(this.scale.width / 2, 30, barWidth + 4, barHeight + 4, 0x000000)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(999);

    // Fundo cinza (barra de fundo)
    this.bossHPBarBG = this.add.rectangle(this.scale.width / 2, 30, barWidth, barHeight, 0x444444)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1000);

    // Barra vermelha (vida real do boss)
    this.bossHPBar = this.add.rectangle(this.scale.width / 2, 30, barWidth, barHeight, 0xff0000)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1001);


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
      .setScrollFactor(0)
      .setDepth(1025);
    // texto
    this.add
      .text(width / 2, height / 2 - 50, "GAME OVER", {
        fontFamily: '"Press Start 2P"',
        fontSize: "40px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1026);
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
      .setInteractive()
      .setDepth(1026);

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
      .setDepth(1026)
      .setInteractive();

    menuBtn.on("pointerdown", () => {
      if (this.fase1Music) this.fase1Music.stop();
      this.scene.start("TitleScene"); // vai para a cena de título
    });

    this.physics.world.pause();
    this.input.keyboard.enabled = false;
  }

  mostrarTelaVitoria() {
    const { width, height } = this.scale;

    // fundo escuro
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1025);

    // título
    this.add.text(width / 2, height / 2 - 60, "Vitória!", {
      fontFamily: '"Press Start 2P"',
      fontSize: "40px",
      color: "#ffffff",
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1026);

    // mensagem
    this.add.text(width / 2, height / 2, "Você derrotou Hugo\nParabéns!", {
      fontFamily: '"Press Start 2P"',
      fontSize: "16px",
      color: "#ffffff",
      align: "center",
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1026);

    // botão para voltar ao menu
    const btn = this.add.text(width / 2, height / 2 + 80, "Voltar ao Início", {
      fontFamily: '"Press Start 2P"',
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive()
      .setDepth(1026);

    btn.on("pointerdown", () => {
      this.scene.start("TitleScene");
    });
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
        .setAlpha(0.7)
        .setDepth(998);

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

          const proj = this.bossProjectiles.create(xInicial, y, "escorpiao");
          proj.setVelocityX(velX);
          proj.setScale(0.125);
          proj.damage = 15;

          this.time.delayedCall(4000, () => {
            if (proj.active) proj.destroy();
          });
        },
      });
    });
  }

  /*mostrarDialogoBoss(frases) {
  const { width, height } = this.scale;

  this.physics.world.pause();
  this.time.paused = true;

  const caixa = this.add.rectangle(width / 2, height - 100, width - 100, 120, 0x000000, 0.8)
    .setStrokeStyle(2, 0xffffff)
    .setDepth(2000);

  const portrait = this.add.image(80, height - 100, "hugo_boss")
    .setScale(0.2)
    .setDepth(2001)
    .setOrigin(0.5);

  const texto = this.add.text(140, height - 140, "", {
    fontFamily: '"Press Start 2P"',
    fontSize: "14px",
    color: "#ffffff",
    wordWrap: { width: width - 200 }
  })
    .setDepth(2001);

  let indexFrase = 0;
  let digitando = false;

  const escreverTexto = (frase) => {
    digitando = true;
    texto.setText("");
    let i = 0;

    this.time.addEvent({
      delay: 30,
      repeat: frase.length - 1,
      callback: () => {
        texto.setText(texto.text + frase[i]);
        i++;
        if (i >= frase.length) digitando = false;
      }
    });
  };

  escreverTexto(frases[indexFrase]);

  const avancarDialogo = () => {
    if (digitando) return;

    indexFrase++;
    if (indexFrase < frases.length) {
        escreverTexto(frases[indexFrase]);
      } else {
        caixa.destroy();
        texto.destroy();
        portrait.destroy();
        this.input.keyboard.off("keydown-SPACE", avancarDialogo);
        this.input.off("pointerdown", avancarDialogo);
        this.physics.world.resume();
        this.time.paused = false;
      }
    };

    this.input.keyboard.on("keydown-SPACE", avancarDialogo);
    this.input.on("pointerdown", avancarDialogo);
  }*/


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
        .setAlpha(0.7)
        .setDepth(998);
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
          const proj = this.bossProjectiles.create(-50, y, "escorpiao");
          proj.setVelocityX(400); // velocidade para a direita
          proj.setScale(0.125);
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
          .setAlpha(0.7)
          .setDepth(998);

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

          const proj = this.meteorProjectiles.create(x, -50, "prova");
          proj.setScale(0.075);
          proj.setVelocityY(600);

          const impactoY = y;
          const distancia = impactoY + 50; // de -50 até y final
          const tempoQueda = distancia / 600 * 1000;

          this.time.delayedCall(tempoQueda, () => {
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
                area.destroy();
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

  executarAtaqueLeque() {
    if (!this.boss || !this.player || this.isGameOver) return;

    const numProjetis = 5;
    const spread = 40; // graus de abertura total do leque
    const angleToPlayer = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
    const angleDeg = Phaser.Math.RadToDeg(angleToPlayer);
    const startAngle = angleDeg - spread / 2;

    for (let i = 0; i < numProjetis; i++) {
      const angle = Phaser.Math.DegToRad(startAngle + (i * (spread / (numProjetis - 1))));
      const velocity = this.physics.velocityFromRotation(angle, 300);

      const proj = this.bossProjectiles.create(this.boss.x, this.boss.y, "zip");
      proj.setScale(0.055);
      proj.setVelocity(velocity.x, velocity.y);
      proj.damage = 15;

      this.time.delayedCall(4000, () => {
        if (proj.active) proj.destroy();
      });
    }
  }

  //------------------------------------------------------------------------------------------

  //verificações de dano
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

  bossTakeDamage(amount) {
    if (!this.boss || this.isGameOver) return;

    this.bossHealth = Math.max(0, this.bossHealth - amount);
    this.updateBossHPBar();

    if (this.bossHealth <= 0) {
      this.boss.setTint(0x000000);
      this.boss.setVelocity(0);
      this.boss.disableBody(true, true);
      this.fase1Music.stop();

      // Congela tudo
      this.physics.world.pause();
      this.time.paused = true;
      this.input.keyboard.enabled = false;

      this.mostrarTelaVitoria();
    }
  }

  updateBossHPBar() {
    const pct = this.bossHealth / this.bossMaxHealth;
    this.bossHPBar.width = 500 * pct;
  }

  update(time, delta) {
    const hpRatio = Phaser.Math.Clamp(this.playerHealth / this.maxHealth, 0, 1);
    this.hpBar.width = 200 * hpRatio;

    //detectar tecla do escudo
    if (
        Phaser.Input.Keyboard.JustDown(this.shieldKey) &&
        this.secondaryWeapon === "shield" &&
        !this.isInvulnerable &&
        time - this.lastShieldTime >= this.shieldCooldown
    ) {
        this.activateShield();
    }

    //detectar tecla do tornado
    if (
      Phaser.Input.Keyboard.JustDown(this.tornadoKey) &&
      time - this.lastTornadoTime >= this.tornadoCooldown
    ) {
      this.activateTornado();
    }

    if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      if (!this.isPaused) {
        this.physics.world.pause();
        this.time.paused = true;
        this.pauseText.setVisible(true);
        this.isPaused = true;
      } else {
        this.physics.world.resume();
        this.time.paused = false;
        this.pauseText.setVisible(false);
        this.isPaused = false;
      }
      return;
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

  //----------------------------------------Itens----------------------------------------

  //escudo
  activateShield() {
    if (this.isInvulnerable) return;

    // 1) Ativa o escudo visualmente e funcionalmente
    this.isInvulnerable = true;
    this.shieldIcon.setAlpha(0.5);
    this.player.setTint(0x00ffff);

    // 2) Depois de 1.5s, desativa o escudo
    this.time.delayedCall(1500, () => {
        this.isInvulnerable = false;
        this.player.clearTint();

        // Marca o tempo do fim do escudo para iniciar cooldown
        this.lastShieldTime = this.time.now;

        // 3) Após o cooldown, restaura o ícone HUD
        this.time.delayedCall(this.shieldCooldown, () => {
        this.shieldIcon.setAlpha(1);
        });
    });
  }

  //tornado
  activateTornado() {
    if (this.isGameOver) return;

    if (!this.boss || !this.boss.active) return;

    const ang = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.boss.x, this.boss.y);

    const tornado = this.physics.add
      .sprite(this.player.x, this.player.y, "tornado1")
      .setScale(0.9);

    tornado.anims.play("tornado_spin");
    tornado.damage = 60; // ou o valor que quiser

    this.physics.velocityFromRotation(ang, 400, tornado.body.velocity);

    // Dano em inimigos normais
    this.physics.add.overlap(tornado, this.enemies, (proj, enemy) => {
      this.applyDamageToEnemy(enemy, proj.damage); // você pode definir essa função como quiser
    });

    // Dano no boss
    if (this.boss && this.boss.active) {
      this.physics.add.overlap(tornado, this.boss, (proj, boss) => {
        this.bossTakeDamage(proj.damage);
      });
    }

    tornado.setCollideWorldBounds(true);
    tornado.body.onWorldBounds = true;
    tornado.body.world.on("worldbounds", (body) => {
      if (body.gameObject === tornado) tornado.destroy();
    });

    this.time.delayedCall(3000, () => {
      if (tornado.active) tornado.destroy();
    });

    this.lastTornadoTime = this.time.now;
    this.tornadoIcon.setAlpha(0.5);
    this.time.delayedCall(this.tornadoCooldown, () => {
      this.tornadoIcon.setAlpha(1);
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
