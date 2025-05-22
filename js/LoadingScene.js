class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
    }

    preload() {
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        this.add.text(centerX, centerY - 100, 'Carregando...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const progressBar = this.add.rectangle(centerX, centerY, 400, 30, 0x444444).setOrigin(0.5);
        const progressFill = this.add.rectangle(centerX - 200, centerY, 0, 30, 0x00ff00).setOrigin(0, 0.5);

        // Evento de progresso
        this.load.on('progress', (value) => {
            progressFill.width = 400 * value;
        });

        // Carregar todos os assets necessários
        this.load.image('title_bg', 'assets/bg.png');
        this.load.audio('menu_music', 'assets/musica-menu-titulo.mp3');
        this.load.image('fase1_bg', 'assets/fase1.png');
        this.load.image('player', 'assets/player.png');
        this.load.image('enemy1', 'assets/enemy1.png');
        this.load.image('enemy2', 'assets/enemy2.png');
        this.load.image('enemy3', 'assets/enemy3.png');
        this.load.image('rastro', 'assets/rastro.png');
        this.load.audio("musica_fase1", "assets/musica-fase1.mp3");
        this.load.audio("musica_enredo", "assets/musica-enredo.mp3");
    }

    create() {
        const readyButton = this.add.text(683, 550, 'PRONTO?', {
            fontFamily: '"Press Start 2P"',
            fontSize: '24px',
            backgroundColor: '#00cc00', // Cor verde chamativa
            color: '#ffffff',
            padding: { x: 20, y: 10 },
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        readyButton.on('pointerdown', () => {
            this.scene.start('TitleScene');
        });
    }
}