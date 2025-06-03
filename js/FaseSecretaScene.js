class FaseSecretaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FaseSecretaScene' });
    }

    preload() {
        // Carrega a imagem de fundo do enredo
        this.load.image('storyBg', 'assets/foto-enredo.png');
        this.load.audio("musica_enredo", "assets/musica-enredo.mp3");
    }

    create() {
        const { width, height } = this.cameras.main;

        this.enredoMusic = this.sound.add("musica_enredo", { loop: true, volume: 0.5 });
        this.enredoMusic.play();


        // Adiciona a imagem de fundo cobrindo toda a tela
        this.add
            .image(0, 0, 'storyBg')
            .setOrigin(0)
            .setDisplaySize(width, height);

        // Título no topo
        this.add
            .text(width / 2, 40, 'História', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#ffffff'
            })
            .setOrigin(0.5);

        // Configurações do card de enredo
        const cardWidth = width * 0.8;
        const cardHeight = height * 0.5;
        const startY = height + cardHeight / 2; // Começa abaixo da tela
        const targetY = height * 0.4; // Posiciona o card mais para cima (40% da altura)

        // Container para o card
        const storyContainer = this.add.container(width / 2, startY);

        // Desenha o plano de fundo do card
        const graphics = this.add.graphics();
        graphics.fillStyle(0x000000, 0.7);
        graphics.fillRoundedRect(
            -cardWidth / 2,
            -cardHeight / 2,
            cardWidth,
            cardHeight,
            20
        );
        storyContainer.add(graphics);

        // Texto do enredo
        const storyText = this.add.text(
            -cardWidth / 2 + 20,
            -cardHeight / 2 + 20,
            `Fase secreta ativada.`,
            {
                font: '22px Arial',
                fill: '#ffffff',
                wordWrap: { width: cardWidth - 40, useAdvancedWrap: true }
            }
        );
        storyContainer.add(storyText);

        // Animação para o card rolando para cima
        this.tweens.add({
            targets: storyContainer,
            y: targetY,
            ease: 'Power1',
            duration: 2000
        });

        // Botão "Começar" posicionado logo abaixo do card
        const buttonY = targetY + cardHeight / 2 + 50;
        const startButton = this.add
            .text(width / 2, buttonY, 'Começar', {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        startButton.on('pointerup', () => {
            this.enredoMusic.stop();
            this.scene.start('FaseSecretaBossScene');
        });
    }
}