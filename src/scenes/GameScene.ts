import Phaser from 'phaser';
import Money from '../entities/Money';
import { getCurrentCurrency, getCurrentMusicTrack, getCurrencyConfig } from '../config/currencies';

export default class GameScene extends Phaser.Scene {
  private throwSound!: Phaser.Sound.BaseSound;
  private bgMusic!: Phaser.Sound.BaseSound;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private moneyGroup!: Phaser.GameObjects.Group;
  private comboText!: Phaser.GameObjects.Text;
  private comboCount: number = 0;
  private musicStopTimer?: Phaser.Time.TimerEvent;
  private isMusicPlaying: boolean = false;
  private isPaused: boolean = false;
  private pauseOverlay?: Phaser.GameObjects.Container;
  private comboResetTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('GameScene');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background color
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Get user preferences
    const currency = getCurrentCurrency();
    const currencyConfig = getCurrencyConfig(currency);
    const musicTrack = getCurrentMusicTrack();

    // Reset score
    this.score = 0;
    this.comboCount = 0;
    this.isMusicPlaying = false;
    this.isPaused = false;

    // 🔊 Create sound instances ONCE with reduced volume
    this.throwSound = this.sound.add('throwSound', {
      volume: 0.2  // Reduced from 0.6 to 0.2
    });

    // 🎵 Background music with loop - use selected track (song1-song6)
    const musicKey = musicTrack === 'song1' ? 'bgMusic' : `bgMusic${musicTrack.substring(4)}`;
    this.bgMusic = this.sound.add(musicKey, {
      volume: 0.3,
      loop: false // Changed to false - play once until end
    });

    // Listen for music complete event
    this.bgMusic.once('complete', () => {
      this.endGame();
    });

    // Music doesn't start automatically - waits for first throw
    this.isMusicPlaying = false;

    // Create group for money objects
    this.moneyGroup = this.add.group({
      runChildUpdate: true
    });

    // Score display
    this.scoreText = this.add.text(16, 16, '0', {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 5
    });
    
    // Currency symbol
    if (currency === 'BGN') {
      // Use text for Bulgarian Lev symbol
      this.add.text(16, 58, 'ЛВ', {
        fontSize: '28px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      });
    } else {
      this.add.text(16, 58, currencyConfig.symbol, {
        fontSize: '28px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      });
    }

    // Pause/Stop button (top right corner)
    this.createPauseButton(width, 16);

    // Combo text (hidden initially)
    this.comboText = this.add.text(width / 2, height * 0.3, '', {
      fontSize: '48px',
      color: '#FF6B35',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.comboText.setOrigin(0.5);
    this.comboText.setVisible(false);

    // 🎮 Input (mouse + touch)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Don't spawn money if game is paused
      if (!this.isPaused) {
        this.spawnMoney(pointer.x, pointer.y);
      }
    });

    // Instructions (fade out after 3 seconds)
    const currencyName = currency === 'BGN' ? 'Български лев' : 'Евро';
    const instructions = this.add.text(width / 2, height * 0.85, 
      `Хвърляш ${currencyName}!\nДокосни, за да хвърлиш пари!\nИграта завършва, когато песента свърши!`, {
      fontSize: '14px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    });
    instructions.setOrigin(0.5);
    
    this.tweens.add({
      targets: instructions,
      alpha: 0,
      duration: 2000,
      delay: 4000,
      onComplete: () => instructions.destroy()
    });
  }

  createPauseButton(x: number, y: number) {
    // Pause button background
    const pauseBtn = this.add.circle(x - 30, y + 30, 25, 0xFF6B35, 0.9)
      .setStrokeStyle(3, 0xFFFFFF)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0)
      .setDepth(1000);

    // Pause icon (two vertical bars)
    this.add.rectangle(x - 36, y + 30, 6, 20, 0xFFFFFF)
      .setScrollFactor(0)
      .setDepth(1001);
    
    this.add.rectangle(x - 24, y + 30, 6, 20, 0xFFFFFF)
      .setScrollFactor(0)
      .setDepth(1001);

    // Button interactions
    pauseBtn.on('pointerover', () => {
      pauseBtn.setFillStyle(0xFF8C55);
      pauseBtn.setScale(1.1);
    });

    pauseBtn.on('pointerout', () => {
      pauseBtn.setFillStyle(0xFF6B35);
      pauseBtn.setScale(1);
    });

    pauseBtn.on('pointerdown', () => {
      pauseBtn.setFillStyle(0xFF5020);
    });

    pauseBtn.on('pointerup', () => {
      pauseBtn.setFillStyle(0xFF6B35);
      this.togglePause();
    });
  }

  togglePause() {
    if (this.isPaused) {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.isPaused = true;
    
    // Pause music
    if (this.isMusicPlaying) {
      this.bgMusic.pause();
    }

    // Pause physics
    this.physics.pause();

    // Create pause overlay
    this.createPauseOverlay();
  }

  resumeGame() {
    this.isPaused = false;

    // Resume music if it was playing
    if (this.bgMusic.isPaused && this.isMusicPlaying) {
      this.bgMusic.resume();
    }

    // Resume physics
    this.physics.resume();

    // Remove pause overlay
    if (this.pauseOverlay) {
      this.pauseOverlay.destroy();
      this.pauseOverlay = undefined;
    }
  }

  createPauseOverlay() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create container for pause menu
    this.pauseOverlay = this.add.container(0, 0);
    this.pauseOverlay.setDepth(2000);

    // Semi-transparent background
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
    this.pauseOverlay.add(bg);

    // Pause title
    const pauseTitle = this.add.text(width / 2, height * 0.25, 'ПАУЗА', {
      fontSize: '48px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    pauseTitle.setOrigin(0.5);
    this.pauseOverlay.add(pauseTitle);

    // Current score display
    const scoreLabel = this.add.text(width / 2, height * 0.38, 'Текущ резултат:', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    scoreLabel.setOrigin(0.5);
    this.pauseOverlay.add(scoreLabel);

    const scoreValue = this.add.text(width / 2, height * 0.44, `${this.score}`, {
      fontSize: '36px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    scoreValue.setOrigin(0.5);
    this.pauseOverlay.add(scoreValue);

    // Resume button
    const resumeButton = this.add.rectangle(width / 2, height * 0.56, 200, 60, 0x4CAF50)
      .setStrokeStyle(4, 0xFFFFFF)
      .setInteractive({ useHandCursor: true });

    const resumeText = this.add.text(width / 2, height * 0.56, 'ПРОДЪЛЖИ', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    resumeText.setOrigin(0.5);

    resumeButton.on('pointerover', () => {
      resumeButton.setFillStyle(0x45a049);
      resumeButton.setScale(1.05);
    });

    resumeButton.on('pointerout', () => {
      resumeButton.setFillStyle(0x4CAF50);
      resumeButton.setScale(1);
    });

    resumeButton.on('pointerdown', () => {
      this.resumeGame();
    });

    this.pauseOverlay.add([resumeButton, resumeText]);

    // Restart button
    const restartButton = this.add.rectangle(width / 2, height * 0.68, 200, 60, 0xFFD700)
      .setStrokeStyle(4, 0xFFFFFF)
      .setInteractive({ useHandCursor: true });

    const restartText = this.add.text(width / 2, height * 0.68, 'РЕСТАРТ', {
      fontSize: '24px',
      color: '#000000',
      fontStyle: 'bold'
    });
    restartText.setOrigin(0.5);

    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0xFFC107);
      restartButton.setScale(1.05);
    });

    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0xFFD700);
      restartButton.setScale(1);
    }); 

    restartButton.on('pointerdown', () => {
      // Clean up timers first
      if (this.musicStopTimer) {
        this.musicStopTimer.remove();
        this.musicStopTimer = undefined;
      }
      if (this.comboResetTimer) {
        this.comboResetTimer.remove();
        this.comboResetTimer = undefined;
      }
      
      // Stop and destroy music explicitly
      if (this.bgMusic) {
        this.bgMusic.stop();
        this.bgMusic.destroy();
      }
      if (this.throwSound) {
        this.throwSound.stop();
      }
      
      // Stop all remaining sounds
      this.sound.stopAll();
      
      // Reset state
      this.isPaused = false;
      this.isMusicPlaying = false;
      this.score = 0;
      this.comboCount = 0;
      
      // Destroy pause overlay
      if (this.pauseOverlay) {
        this.pauseOverlay.destroy();
        this.pauseOverlay = undefined;
      }
      
      // Resume physics before restarting
      this.physics.resume();
      
      // Restart the scene
      this.scene.restart();
    });

    this.pauseOverlay.add([restartButton, restartText]);

    // Quit to menu button
    const quitButton = this.add.rectangle(width / 2, height * 0.80, 200, 60, 0xFF6B35)
      .setStrokeStyle(4, 0xFFFFFF)
      .setInteractive({ useHandCursor: true });

    const quitText = this.add.text(width / 2, height * 0.80, 'ИЗХОД', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
    quitText.setOrigin(0.5);

    quitButton.on('pointerover', () => {
      quitButton.setFillStyle(0xFF8C55);
      quitButton.setScale(1.05);
    });

    quitButton.on('pointerout', () => {
      quitButton.setFillStyle(0xFF6B35);
      quitButton.setScale(1);
    });

    quitButton.on('pointerdown', () => {
      // Clean up timers first
      if (this.musicStopTimer) {
        this.musicStopTimer.remove();
        this.musicStopTimer = undefined;
      }
      if (this.comboResetTimer) {
        this.comboResetTimer.remove();
        this.comboResetTimer = undefined;
      }
      
      // Stop and destroy music explicitly
      if (this.bgMusic) {
        this.bgMusic.stop();
        this.bgMusic.destroy();
      }
      if (this.throwSound) {
        this.throwSound.stop();
      }
      
      // Stop all remaining sounds
      this.sound.stopAll();
      
      // Reset state
      this.isPaused = false;
      this.isMusicPlaying = false;
      
      // Destroy pause overlay
      if (this.pauseOverlay) {
        this.pauseOverlay.destroy();
        this.pauseOverlay = undefined;
      }
      
      // Resume physics before changing scene
      this.physics.resume();
      
      // Go to menu
      this.scene.start('MenuScene');
    });

    this.pauseOverlay.add([quitButton, quitText]);
  }

  spawnMoney(x: number, y: number) {
    const money = new Money(this, x, y);
    money.throw();
    this.moneyGroup.add(money);

    // 🔊 PLAY SOUND ON THROW
    this.throwSound.play();

    // 🎵 Start or resume music on throw
    if (!this.isMusicPlaying) {
      if (this.bgMusic.isPaused) {
        // Resume from where it was paused
        this.bgMusic.resume();
      } else {
        // Start from beginning
        this.bgMusic.play();
      }
      this.isMusicPlaying = true;
    }

    // Cancel previous music stop timer if exists
    if (this.musicStopTimer) {
      this.musicStopTimer.remove();
    }

    // Set new timer to pause music after 1 second of inactivity
    this.musicStopTimer = this.time.delayedCall(1000, () => {
      this.pauseMusicFromInactivity();
    });

    // Combo system
    this.comboCount++;
    if (this.comboCount >= 3) {
      this.showCombo();
    }

    // Cancel previous combo reset timer
    if (this.comboResetTimer) {
      this.comboResetTimer.remove();
    }

    // Reset combo after 2 seconds of no throws
    this.comboResetTimer = this.time.delayedCall(2000, () => {
      this.comboCount = 0;
      this.comboResetTimer = undefined;
    });

    // Add score when money is thrown
    this.updateScore(money.getBanknoteValue());

    // Optional: Screen shake effect for impact
    this.cameras.main.shake(100, 0.002);
  }

  pauseMusicFromInactivity() {
    if (this.isMusicPlaying && !this.isPaused) {
      // Pause instead of stop to keep the position
      this.bgMusic.pause();
      this.isMusicPlaying = false;
    }
  }

  showCombo() {
    this.comboText.setText(`КОМБО x${this.comboCount}!`);
    this.comboText.setVisible(true);
    
    this.tweens.add({
      targets: this.comboText,
      scale: { from: 0.5, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 800,
      ease: 'Bounce.easeOut',
      onComplete: () => {
        this.comboText.setVisible(false);
        this.comboText.setScale(1);
        this.comboText.setAlpha(1);
      }
    });
    
    // Bonus points for combo
    this.updateScore(this.comboCount * 5);
  }

  updateScore(points: number) {
    this.score += points;
    this.scoreText.setText(`${this.score}`);
    
    // Pulse animation on score update
    this.tweens.add({
      targets: [this.scoreText],
      scale: { from: 1, to: 1.2 },
      duration: 100,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  endGame() {
    // Cancel timers if they exist
    if (this.musicStopTimer) {
      this.musicStopTimer.remove();
      this.musicStopTimer = undefined;
    }
    if (this.comboResetTimer) {
      this.comboResetTimer.remove();
      this.comboResetTimer = undefined;
    }

    // Stop and destroy music explicitly
    if (this.bgMusic) {
      this.bgMusic.stop();
      this.bgMusic.destroy();
    }
    if (this.throwSound) {
      this.throwSound.stop();
    }
    
    // Stop all remaining sounds
    this.sound.stopAll();
    
    // Reset music state
    this.isMusicPlaying = false;

    // Go to game over scene
    this.scene.start('GameOverScene', { score: this.score });
  }

  shutdown() {
    // Stop and destroy music explicitly
    if (this.bgMusic) {
      this.bgMusic.stop();
      this.bgMusic.destroy();
    }
    if (this.throwSound) {
      this.throwSound.stop();
    }
    
    // Stop all remaining sounds
    this.sound.stopAll();
    
    // Clean up timers when scene is shutdown
    if (this.musicStopTimer) {
      this.musicStopTimer.remove();
      this.musicStopTimer = undefined;
    }
    if (this.comboResetTimer) {
      this.comboResetTimer.remove();
      this.comboResetTimer = undefined;
    }
    
    // Reset music state
    this.isMusicPlaying = false;
    this.isPaused = false;
  }

  update() {
    // Money objects update themselves
  }
}
