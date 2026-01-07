import Phaser from 'phaser';
import { getCurrencyConfig, getCurrentCurrency } from '../config/currencies';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Background color
    this.cameras.main.setBackgroundColor('#87CEEB');
    
    // Title
    const title = this.add.text(width / 2, height * 0.20, 'Хвърляй пари!', {
      fontSize: '42px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    });
    title.setOrigin(0.5);
    
    // Show current currency
    const currency = getCurrentCurrency();
    const currencyConfig = getCurrencyConfig(currency);
    const currencyLabel = this.add.text(width / 2, height * 0.30, 
      `${currencyConfig.flag} ${currencyConfig.code}`, {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    });
    currencyLabel.setOrigin(0.5);
    
    // Add floating banknotes as decoration
    this.createFloatingBanknotes();
    
    // Start button
    const startButton = this.add.rectangle(width / 2, height * 0.50, 180, 70, 0x4CAF50)
      .setStrokeStyle(4, 0xFFFFFF)
      .setInteractive({ useHandCursor: true });
    
    // Start button text
    const startText = this.add.text(width / 2, height * 0.50, 'СТАРТ', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    startText.setOrigin(0.5);
    
    // Button hover effects
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x45a049);
      startButton.setScale(1.05);
    });
    
    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x4CAF50);
      startButton.setScale(1);
    });
    
    startButton.on('pointerdown', () => {
      startButton.setFillStyle(0x3d8b40);
    });
    
    startButton.on('pointerup', () => {
      startButton.setFillStyle(0x4CAF50);
      this.scene.start('GameScene');
    });
    
    // Settings button
    const settingsButton = this.add.rectangle(width / 2, height * 0.68, 180, 60, 0x2196F3)
      .setStrokeStyle(4, 0xFFFFFF)
      .setInteractive({ useHandCursor: true });
    
    const settingsText = this.add.text(width / 2, height * 0.68, '⚙️ НАСТРОЙКИ', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    settingsText.setOrigin(0.5);
    
    settingsButton.on('pointerover', () => {
      settingsButton.setFillStyle(0x1976D2);
      settingsButton.setScale(1.05);
    });
    
    settingsButton.on('pointerout', () => {
      settingsButton.setFillStyle(0x2196F3);
      settingsButton.setScale(1);
    });
    
    settingsButton.on('pointerdown', () => {
      settingsButton.setFillStyle(0x1565C0);
    });
    
    settingsButton.on('pointerup', () => {
      settingsButton.setFillStyle(0x2196F3);
      this.scene.start('SettingsScene');
    });
    
    // Instructions
    const instructions = this.add.text(width / 2, height * 0.85, 
      'Докосни, за да хвърлиш пари!\nИграта завършва, когато песента свърши!', {
      fontSize: '13px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    });
    instructions.setOrigin(0.5);
  }
  
  createFloatingBanknotes() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Add some decorative banknotes floating in background
    const currency = getCurrentCurrency();
    const currencyConfig = getCurrencyConfig(currency);
    
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(100, height - 100);
      const randomIndex = Phaser.Math.Between(0, currencyConfig.imageKeys.length - 1);
      const imageKey = currencyConfig.imageKeys[randomIndex];
      
      const banknote = this.add.sprite(x, y, imageKey)
        .setScale(0.08)
        .setAlpha(0.3)
        .setAngle(Phaser.Math.Between(-30, 30));
      
      // Gentle floating animation
      this.tweens.add({
        targets: banknote,
        y: y + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}
