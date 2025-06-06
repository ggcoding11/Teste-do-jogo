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

    this.load.image("fase1_bg", "assets/fase1.png");
    this.load.image("fase2_bg", "assets/fase2.png");
    this.load.image("fase3_bg", "assets/fase3.png");
    this.load.image("fase4_bg", "assets/fase4.png");
    this.load.image("fase5_bg", "assets/fase5.png");
    this.load.image("fase6_bg", "assets/fase6.png");
    this.load.image("player", "assets/player.png");

    this.load.image("luxuria1", "assets/luxuria-inimigo1.png");
    this.load.image("luxuria2", "assets/luxuria-inimigo2.png");
    this.load.image("luxuria3", "assets/luxuria-inimigo3.png");
    this.load.image("luxuriaBoss", "assets/luxuria_boss.png");

    this.load.image("gula1", "assets/gula-inimigo1.png");
    this.load.image("gula2", "assets/gula-inimigo2.png");
    this.load.image("gula3", "assets/gula-inimigo3.png");
    this.load.image("gulaBoss", "assets/gula_boss.png");

    this.load.image("avareza1", "assets/avareza-inimigo1.png");
    this.load.image("avareza2", "assets/avareza-inimigo2.png");
    this.load.image("avareza3", "assets/avareza-inimigo3.png");
    this.load.image("avarezaBoss", "assets/avareza_boss.png");

    this.load.image("ira1", "assets/ira-inimigo1.png");
    this.load.image("ira2", "assets/ira-inimigo2.png");
    this.load.image("ira3", "assets/ira-inimigo3.png");
    this.load.image("iraBoss", "assets/ira_boss.png");

    this.load.image("violencia1", "assets/violencia-inimigo1.png");
    this.load.image("violencia2", "assets/violencia-inimigo2.png");
    this.load.image("violencia3", "assets/violencia-inimigo3.png");
    this.load.image("violenciaBoss", "assets/violencia_boss.png");

    this.load.image("fraude1", "assets/fraude-inimigo1.png");
    this.load.image("fraude2", "assets/fraude-inimigo2.png");
    this.load.image("fraude3", "assets/fraude-inimigo3.png");
    this.load.image("fraudeBoss", "assets/fraude_boss.png");

    this.load.image("traicao1", "assets/traicao-inimigo1.png");
    this.load.image("traicao2", "assets/traicao-inimigo2.png");
    this.load.image("traicao3", "assets/traicao-inimigo3.png");
    this.load.image("traicaoBoss", "assets/traicao_boss.png");

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
    this.load.image("staffProj", "assets/staff_proj.png"); // projétil do cajado
    this.load.image("fase7_bg", "assets/fase7.png");
    this.load.image("boss_final", "assets/boss-final.png"); // sprite do boss
    this.load.image("projetil_boss", "assets/projetil_boss.png");
    this.load.audio("boss_theme", "assets/boss_theme.mp3");

    // ícones de power‐up
    this.load.image("icon_tornado", "assets/icon_tornado.png");
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
