import Phaser from 'phaser';
import { getCurrentCurrency, getCurrencyConfig } from '../config/currencies';

export default class GameOverScene extends Phaser.Scene {
  private finalScore: number = 0;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number }) {
    this.finalScore = data.score || 0;
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background color
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Get currency config
    const currency = getCurrentCurrency();
    const currencyConfig = getCurrencyConfig(currency);

    // Game Over title
    const gameOverText = this.add.text(width / 2, height * 0.25, 'Край!', {
      fontSize: '48px',
      color: '#FF4444',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    // Final score container
    const scoreContainer = this.add.container(width / 2, height * 0.42);
    
    const scoreLabel = this.add.text(0, -30, 'Краен резултат:', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    scoreLabel.setOrigin(0.5);
    
    const scoreValue = this.add.text(0, 15, `${this.finalScore}`, {
      fontSize: '42px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5
    });
    scoreValue.setOrigin(0.5);
    
    // Display currency symbol
    const currencySymbol = this.add.text(scoreValue.width / 2 + 15, 15, currencyConfig.symbol, {
      fontSize: '36px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    currencySymbol.setOrigin(0, 0.5);
    scoreContainer.add([scoreLabel, scoreValue, currencySymbol]);

    // Show decorative banknotes
    this.createFloatingBanknotes();

    // Restart button
    const restartButton = this.add.rectangle(width / 2, height * 0.62, 200, 60, 0x4CAF50)
      .setStrokeStyle(4, 0xFFFFFF)
      .setInteractive({ useHandCursor: true });

    const restartText = this.add.text(width / 2, height * 0.62, 'РЕСТАРТ', {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    restartText.setOrigin(0.5);

    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0x45a049);
      restartButton.setScale(1.05);
    });

    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0x4CAF50);
      restartButton.setScale(1);
    });

    restartButton.on('pointerdown', () => {
      restartButton.setFillStyle(0x3d8b40);
    });

    restartButton.on('pointerup', () => {
      restartButton.setFillStyle(0x4CAF50);
      this.scene.start('GameScene');
    });

    // Menu button
    const menuButton = this.add.rectangle(width / 2, height * 0.78, 200, 60, 0x2196F3)
      .setStrokeStyle(4, 0xFFFFFF)
      .setInteractive({ useHandCursor: true });

    const menuText = this.add.text(width / 2, height * 0.78, 'МЕНЮ', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    menuText.setOrigin(0.5);

    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x1976D2);
      menuButton.setScale(1.05);
    });

    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x2196F3);
      menuButton.setScale(1);
    });

    menuButton.on('pointerdown', () => {
      menuButton.setFillStyle(0x1565C0);
    });

    menuButton.on('pointerup', () => {
      menuButton.setFillStyle(0x2196F3);
      this.scene.start('MenuScene');
    });
    
    // Animate score
    this.tweens.add({
      targets: scoreContainer,
      scale: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });
  }
  
  createFloatingBanknotes() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    const currency = getCurrentCurrency();
    const currencyConfig = getCurrencyConfig(currency);
    
    // Add decorative banknotes
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(80, height - 80);
      const randomIndex = Phaser.Math.Between(0, currencyConfig.imageKeys.length - 1);
      const imageKey = currencyConfig.imageKeys[randomIndex];
      
      const banknote = this.add.sprite(x, y, imageKey)
        .setScale(0.06)
        .setAlpha(0.2)
        .setAngle(Phaser.Math.Between(-45, 45));
      
      // Gentle rotation
      this.tweens.add({
        targets: banknote,
        angle: banknote.angle + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }
}
