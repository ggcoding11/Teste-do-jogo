class FaseSecretaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FaseSecretaScene' });
    }

    preload() {
        // Carrega a imagem de fundo do enredo
        this.load.image('storyBg', 'assets/foto-enredo2.png');
        this.load.audio("musica_enredo", "assets/musica-enredo2.mp3");
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
            .text(width / 2, 40, '???', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                fill: '#ffffff'
            })
            .setOrigin(0.5);

        // Configurações do card de enredo
        const cardWidth = width * 0.8;
        const cardHeight = height * 0.80;
        const startY = height + cardHeight / 2; // Começa abaixo da tela
        const targetY = height * 0.475; // Posiciona o card mais para cima (40% da altura)

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
            `Ao andar pelas ruínas de um castelo, você escuta através das paredes uma conversa entre dois demônios que aparentemente não perceberam sua presença.
            
            1º — Você ouviu? A sala se abriu de novo. Aquela... A outra sala

            2º — A que foi selada por trezentos anos? Onde aquele ser ficou preso?

           1º — Ele não foi preso. Ficou. Por vontade própria. Disse que só sairia quando alguém digno aparecesse.

           2º — Digno? Digno de quê?

           1º — Digno de conseguir.. descompactar um arquivo .zip...

           2º — E o que isso quer dizer?

           1º — E eu tenho cara de quem sabe?
           
           2º — É, tem razão, porque eu achei que um idiota como você saberia?
           
           Antes mesmo de conseguir retrucar, ambos são interrompidos por uma terceira voz.
           
           3º — VOCÊS.. VOLTEM JÁ A SEUS POSTOS E PAREM DE TAGARELAR.
           
           A conversa se encerra sem mais nenhum ruído, você segue em frente.`,
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