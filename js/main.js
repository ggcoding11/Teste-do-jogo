const config = {
  type: Phaser.AUTO,
  width: 1366,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [LoadingScene, TitleScene, EnredoScene, Fase1Scene, Fase2Scene, Fase3Scene, Fase4Scene, Fase5Scene, Fase6Scene, Fase7Scene, FaseSecretaScene, FaseSecretaBossScene],
};
new Phaser.Game(config);
