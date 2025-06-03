class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');

    this.konamiCode = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
    ];
    this.inputSequence = [];
    this.konamiActivated = false;
  }

  preload() {
    this.load.image('title_bg', 'assets/bg.png'); // imagem da tela inicial
    this.load.audio('menu_music', 'assets/musica-menu-titulo.mp3');
  }

  create() {
    this.add.image(683, 384, 'title_bg');

    this.menuMusic = this.sound.add('menu_music', { loop: true, volume: 0.5 });

    if (this.sound.context.state === 'suspended') {
      this.sound.context.resume(); // Resume o AudioContext antes de tocar a música
    }
    this.menuMusic.play();

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

    this.input.keyboard.on('keydown', (event) => {
    this.inputSequence.push(event.key);

    // Mantém o array com o mesmo comprimento do código
    if (this.inputSequence.length > this.konamiCode.length) {
      this.inputSequence.shift();
    }

    // Verifica se a sequência está correta
    if (JSON.stringify(this.inputSequence) === JSON.stringify(this.konamiCode)) {
      this.konamiActivated = true;
      console.log("Código Konami ativado!");
    }
    });

    startButton.on('pointerdown', () => {
      this.menuMusic.stop();

      if (this.konamiActivated) {
        this.scene.start('FaseSecretaScene');
      } else {
        this.scene.start('EnredoScene');
      }
    });
  }
}