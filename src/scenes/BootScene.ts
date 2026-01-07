import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Зареждане...',
            style: {
                font: '20px monospace',
                color: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2,
            text: '0%',
            style: {
                font: '18px monospace',
                color: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        // Update loading bar
        this.load.on('progress', (value: number) => {
            percentText.setText(Math.floor(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // Handle file load errors - remove failed textures
        this.load.on('loaderror', (file: any) => {
            console.warn(`Неуспешно зареждане: ${file.key}`);
            // Remove the failed texture so fallback can create it
            if (this.textures.exists(file.key)) {
                this.textures.remove(file.key);
            }
        });

        // Load Bulgarian Lev banknotes from currencies/bgn folder
        this.load.image('bgn_1', '/assets/images/currencies/bgn/1.png');
        this.load.image('bgn_5', '/assets/images/currencies/bgn/5.png');
        this.load.image('bgn_10', '/assets/images/currencies/bgn/10.png');
        this.load.image('bgn_20', '/assets/images/currencies/bgn/20.png');
        this.load.image('bgn_50', '/assets/images/currencies/bgn/50.png');
        this.load.image('bgn_100', '/assets/images/currencies/bgn/100.png');

        // Load Euro banknotes from currencies/eur folder
        this.load.image('eur_5', '/assets/images/currencies/eur/5.png');
        this.load.image('eur_10', '/assets/images/currencies/eur/10.png');
        this.load.image('eur_20', '/assets/images/currencies/eur/20.png');
        this.load.image('eur_50', '/assets/images/currencies/eur/50.png');
        this.load.image('eur_100', '/assets/images/currencies/eur/100.png');
        this.load.image('eur_200', '/assets/images/currencies/eur/200.png');
        this.load.image('eur_500', '/assets/images/currencies/eur/500.png');

        // Load audio - throw sound
        this.load.audio('throwSound', '/assets/sounds/click.mp3');

        // Load all 6 music tracks
        this.load.audio('bgMusic', '/assets/sounds/song1.mp3');
        this.load.audio('bgMusic2', '/assets/sounds/song2.mp3');
        this.load.audio('bgMusic3', '/assets/sounds/song3.mp3');
        this.load.audio('bgMusic4', '/assets/sounds/song4.mp3');
        this.load.audio('bgMusic5', '/assets/sounds/song5.mp3');
        this.load.audio('bgMusic6', '/assets/sounds/song6.mp3');
    }

    create() {
        // Generate fallback textures for any failed images
        this.generateFallbackTextures();

        this.scene.start('MenuScene');
    }

    generateFallbackTextures() {
        const currencies = [
            { prefix: 'bgn', values: [1, 5, 10, 20, 50, 100], color: 0x9C27B0, symbol: 'лв' },
            { prefix: 'eur', values: [5, 10, 20, 50, 100, 200, 500], color: 0x2196F3, symbol: '€' }
        ];

        currencies.forEach(({ prefix, values, color, symbol }) => {
            values.forEach((value) => {
                const key = `${prefix}_${value}`;

                // Only create fallback if texture doesn't exist or is invalid
                const texture = this.textures.get(key);
                if (!texture || texture.key === '__MISSING') {
                    console.log(`Създаване на резервен за ${key}`);

                    // Create fallback texture
                    const graphics = this.make.graphics({ x: 0, y: 0 }, false);
                    graphics.fillStyle(color, 1);
                    graphics.fillRoundedRect(0, 0, 576, 321, 20);
                    graphics.lineStyle(8, 0xFFD700, 1);
                    graphics.strokeRoundedRect(0, 0, 576, 321, 20);
                    graphics.generateTexture(key, 576, 321);
                    graphics.destroy();

                    // Add text
                    const text = this.make.text({
                        x: 288,
                        y: 160,
                        text: `${value}${symbol}`,
                        style: {
                            fontSize: '100px',
                            color: '#ffffff',
                            fontStyle: 'bold',
                            stroke: '#000000',
                            strokeThickness: 10
                        }
                    }, false);
                    text.setOrigin(0.5);

                    const rt = this.make.renderTexture({ x: 0, y: 0, width: 576, height: 321 }, false);
                    rt.draw(key, 0, 0);
                    rt.draw(text, 0, 0);
                    rt.saveTexture(key);
                    rt.destroy();
                    text.destroy();
                }
            });
        });
    }
}
