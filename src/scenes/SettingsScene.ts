import Phaser from 'phaser';

export interface GameSettings {
  currency: 'BGN' | 'EUR';
  musicTrack: 'song1' | 'song2' | 'song3' | 'song4' | 'song5' | 'song6';
}

export default class SettingsScene extends Phaser.Scene {
  private selectedCurrency: 'BGN' | 'EUR' = 'BGN';
  private selectedMusic: 'song1' | 'song2' | 'song3' | 'song4' | 'song5' | 'song6' = 'song1';
  
  private currencyButtons: Map<string, Phaser.GameObjects.Container> = new Map();
  private musicButtons: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super('SettingsScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Load saved settings
    this.loadSettings();

    // Title
    const title = this.add.text(width / 2, 60, 'Настройки', {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    title.setOrigin(0.5);

    // Currency Selection Section
    this.add.text(width / 2, 140, 'Избери валута:', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Currency buttons - 2 currencies side by side
    this.createCurrencyButton('BGN', 'ЛЕВ', width / 2 - 70, 190);
    this.createCurrencyButton('EUR', 'ЕВРО', width / 2 + 70, 190);

    // Music Selection Section
    this.add.text(width / 2, 280, 'Избери музика:', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Music buttons - 3x2 grid layout
    const musicStartY = 330;
    const musicSpacingX = 110;
    const musicSpacingY = 75;
    
    this.createMusicButton('song1', '♪ 1', width / 2 - musicSpacingX, musicStartY);
    this.createMusicButton('song2', '♪ 2', width / 2, musicStartY);
    this.createMusicButton('song3', '♪ 3', width / 2 + musicSpacingX, musicStartY);
    this.createMusicButton('song4', '♪ 4', width / 2 - musicSpacingX, musicStartY + musicSpacingY);
    this.createMusicButton('song5', '♪ 5', width / 2, musicStartY + musicSpacingY);
    this.createMusicButton('song6', '♪ 6', width / 2 + musicSpacingX, musicStartY + musicSpacingY);

    // Back button
    const backButton = this.add.rectangle(width / 2, height - 60, 180, 50, 0x4CAF50)
      .setStrokeStyle(4, 0xFFFFFF)
      .setInteractive({ useHandCursor: true });

    const backText = this.add.text(width / 2, height - 60, 'НАЗАД', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    backText.setOrigin(0.5);

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x45a049);
      backButton.setScale(1.05);
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x4CAF50);
      backButton.setScale(1);
    });

    backButton.on('pointerdown', () => {
      backButton.setFillStyle(0x3d8b40);
    });

    backButton.on('pointerup', () => {
      backButton.setFillStyle(0x4CAF50);
      this.saveSettings();
      this.scene.start('MenuScene');
    });

    // Update initial selection visuals
    this.updateCurrencySelection();
    this.updateMusicSelection();
  }

  createCurrencyButton(id: string, label: string, x: number, y: number) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 100, 70, 0x4a4a4a)
      .setStrokeStyle(3, 0xffffff);

    const text = this.add.text(0, 0, label, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center'
    });
    text.setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(100, 70);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.selectedCurrency = id as 'BGN' | 'EUR';
      this.updateCurrencySelection();
    });

    container.on('pointerover', () => {
      bg.setFillStyle(0x5a5a5a);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0x4a4a4a);
    });

    this.currencyButtons.set(id, container);
  }

  createMusicButton(id: string, label: string, x: number, y: number) {
    const container = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 90, 55, 0xFF6B35)
      .setStrokeStyle(3, 0xffffff);

    const text = this.add.text(0, 0, label, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });
    text.setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(90, 55);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      this.selectedMusic = id as 'song1' | 'song2' | 'song3' | 'song4' | 'song5' | 'song6';
      this.updateMusicSelection();
      
      // Preview the music
      this.sound.stopAll();
      const musicKey = `bgMusic${id === 'song1' ? '' : id.substring(4)}`;
      const preview = this.sound.add(musicKey, {
        volume: 0.3
      });
      preview.play();
      
      this.time.delayedCall(3000, () => {
        preview.stop();
      });
    });

    container.on('pointerover', () => {
      bg.setFillStyle(0xFF8C55);
      container.setScale(1.1);
    });

    container.on('pointerout', () => {
      bg.setFillStyle(0xFF6B35);
      container.setScale(1);
    });

    this.musicButtons.set(id, container);
  }

  updateCurrencySelection() {
    this.currencyButtons.forEach((container, id) => {
      const bg = container.list[0] as Phaser.GameObjects.Rectangle;
      if (id === this.selectedCurrency) {
        bg.setFillStyle(0x4CAF50);
        bg.setStrokeStyle(4, 0xFFD700);
      } else {
        bg.setFillStyle(0x4a4a4a);
        bg.setStrokeStyle(3, 0xffffff);
      }
    });
  }

  updateMusicSelection() {
    this.musicButtons.forEach((container, id) => {
      const bg = container.list[0] as Phaser.GameObjects.Rectangle;
      const text = container.list[1] as Phaser.GameObjects.Text;
      if (id === this.selectedMusic) {
        bg.setFillStyle(0x4CAF50);
        bg.setStrokeStyle(4, 0xFFD700);
        text.setColor('#FFD700');
      } else {
        bg.setFillStyle(0xFF6B35);
        bg.setStrokeStyle(3, 0xffffff);
        text.setColor('#ffffff');
      }
    });
  }

  loadSettings() {
    const settings = localStorage.getItem('gameSettings');
    if (settings) {
      const parsed: GameSettings = JSON.parse(settings);
      this.selectedCurrency = parsed.currency || 'BGN';
      this.selectedMusic = parsed.musicTrack || 'song1';
    }
  }

  saveSettings() {
    const settings: GameSettings = {
      currency: this.selectedCurrency,
      musicTrack: this.selectedMusic
    };
    localStorage.setItem('gameSettings', JSON.stringify(settings));
    console.log('Настройките са запазени:', settings);
  }
}
