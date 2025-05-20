class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  preload() {
    this.load.image('title_bg', 'assets/bg.png'); // imagem da tela inicial
  }

  create() {
    this.add.image(683, 384, 'title_bg');

    const titleText = this.add.text(683, 200, 'O PREÇO DO NOME', {
      fontFamily: '"Press Start 2P"',
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const startButton = this.add.text(683, 400, 'COMEÇAR', {
      fontFamily: '"Press Start 2P"',
      fontSize: '20px',
      backgroundColor: '#660000',
      color: '#fff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
