class LoadingScene extends Phaser.Scene {
  constructor() {
    super("LoadingScene");
  }

  preload() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add
      .text(centerX, centerY - 100, "Carregando...", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const progressBar = this.add
      .rectangle(centerX, centerY, 400, 30, 0x444444)
      .setOrigin(0.5);
    const progressFill = this.add
      .rectangle(centerX - 200, centerY, 0, 30, 0x00ff00)
      .setOrigin(0, 0.5);

    // Evento de progresso
    this.load.on("progress", (value) => {
      progressFill.width = 400 * value;
    });

    // Carregar todos os assets necessários
    this.load.image("fase1_bg", "assets/fase1.png");
    this.load.image("fase2_bg", "assets/fase2.png");
    this.load.image("fase3_bg", "assets/fase3.png");
    this.load.image("fase4_bg", "assets/fase4.png");
    this.load.image("fase5_bg", "assets/fase5.png");
    this.load.image("fase6_bg", "assets/fase6.png");
    this.load.image("player", "assets/player.png");
    this.load.image("enemy1", "assets/enemy1.png");
    this.load.image("enemy2", "assets/enemy2.png");
    this.load.image("enemy3", "assets/enemy3.png");
    this.load.image("miniboss1", "assets/miniboss1.png");
    this.load.image("rastro", "assets/rastro.png");
    this.load.audio("sfxCut", "assets/sfx-corte.mp3");
    this.load.audio("morte1", "assets/morte1.mp3");
    this.load.audio("morte2", "assets/morte2.mp3");
    this.load.audio("morte3", "assets/morte3.mp3");
    this.load.audio("morte4", "assets/morte4.mp3");
    this.load.audio("morte5", "assets/morte5.mp3");
    this.load.audio("morte6", "assets/morte6.mp3");
    this.load.audio("morte7", "assets/morte7.mp3");
    this.load.audio("levelUp", "assets/level-up.mp3");
    this.load.image("projetil", "assets/projetil.png");
    this.load.audio("musica_fase1", "assets/musica-fase1.mp3");
    this.load.audio("musica_fase2", "assets/musica-fase2.mp3");
    this.load.audio("musica_fase3", "assets/musica-fase3.mp3");
    this.load.audio("musica_fase4", "assets/musica-fase4.mp3");
    this.load.audio("musica_fase5", "assets/musica-fase5.mp3");
    this.load.audio("musica_fase6", "assets/musica-fase6.mp3");
    this.load.image("tornado1", "assets/tornado1.png");
    this.load.image("tornado2", "assets/tornado2.png");
    this.load.image("tornado3", "assets/tornado3.png");
    this.load.image("tornado4", "assets/tornado4.png");
    this.load.image("arrow", "assets/arrow.png"); // flecha do arco
    this.load.image("staffProj", "assets/staff_proj.png"); // projétil do cajado

    // ícones de power‐up
    this.load.image("icon_bow", "assets/icon_bow.png");
    this.load.image("icon_staff", "assets/icon_staff.png");
    this.load.image("icon_shield", "assets/icon_shield.png");
  }

  create() {
    const readyButton = this.add
      .text(683, 550, "PRONTO?", {
        fontFamily: '"Press Start 2P"',
        fontSize: "24px",
        backgroundColor: "#00cc00", // Cor verde chamativa
        color: "#ffffff",
        padding: { x: 20, y: 10 },
        align: "center",
      })
      .setOrigin(0.5)
      .setInteractive();

    readyButton.on("pointerdown", () => {
      this.scene.start("TitleScene");
    });
  }
}
