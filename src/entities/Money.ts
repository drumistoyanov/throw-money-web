import Phaser from 'phaser';
import { getCurrencyConfig, getCurrentCurrency } from '../config/currencies';

export default class Money extends Phaser.Physics.Arcade.Sprite {
  private maxHeight: number = 0;
  private banknoteValue: number = 0;
  private currency: 'BGN' | 'EUR' = 'BGN';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Get current currency from settings
    const currency = getCurrentCurrency();
    const currencyConfig = getCurrencyConfig(currency);
    
    // Pick a random banknote from current currency
    const randomIndex = Phaser.Math.Between(0, currencyConfig.denominations.length - 1);
    const denomination = currencyConfig.denominations[randomIndex];
    const imageKey = currencyConfig.imageKeys[randomIndex];
    
    super(scene, x, y, imageKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.currency = currency;
    this.banknoteValue = denomination;
    this.setScale(0.12);
    this.setCollideWorldBounds(false);
    
    // Track initial position
    this.maxHeight = y;
  }

  throw() {
    const forceX = Phaser.Math.Between(-200, 200);
    const forceY = Phaser.Math.Between(-600, -800);

    this.setVelocity(forceX, forceY);
    this.setAngularVelocity(Phaser.Math.Between(-300, 300));
  }

  update() {
    // Track max height reached
    if (this.y < this.maxHeight) {
      this.maxHeight = this.y;
    }

    // Destroy if off screen
    const scene = this.scene;
    if (this.y > scene.cameras.main.height + 100 || 
        this.x < -100 || 
        this.x > scene.cameras.main.width + 100) {
      this.destroy();
    }
  }

  getScore(): number {
    // Calculate score based on max height reached and banknote value
    const initialY = this.scene.cameras.main.height;
    const heightReached = initialY - this.maxHeight;
    const heightScore = Math.floor(heightReached / 50);
    
    // Higher value banknotes give bonus points
    return heightScore + this.banknoteValue;
  }
  
  getBanknoteValue(): number {
    return this.banknoteValue;
  }
  
  getCurrency(): string {
    return this.currency;
  }
}
