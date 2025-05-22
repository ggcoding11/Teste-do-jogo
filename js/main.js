const config = {
  type: Phaser.AUTO,
  width: 1366,
  height: 768,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scene: [LoadingScene, TitleScene, EnredoScene, GameScene],
};
new Phaser.Game(config);
