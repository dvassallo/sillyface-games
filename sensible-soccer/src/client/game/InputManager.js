export default class InputManager {
  constructor() {
    this.keys = {};
    this.keysJustPressed = {};  // For one-shot actions
    this.keysJustReleased = {}; // For release detection
    this.gamepadIndex = null;
    this.prevGamepadButtons = {};

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleGamepadConnected = this.handleGamepadConnected.bind(this);
    this.handleGamepadDisconnected = this.handleGamepadDisconnected.bind(this);

    // Add listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('gamepadconnected', this.handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
  }

  handleKeyDown(e) {
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyX'].includes(e.code)) {
      e.preventDefault();
    }
    // Track "just pressed" for one-shot actions
    if (!this.keys[e.code]) {
      this.keysJustPressed[e.code] = true;
    }
    this.keys[e.code] = true;
  }

  handleKeyUp(e) {
    // Track "just released" for charge-release actions
    if (this.keys[e.code]) {
      this.keysJustReleased[e.code] = true;
    }
    this.keys[e.code] = false;
  }

  handleGamepadConnected(e) {
    console.log('Gamepad connected:', e.gamepad.id);
    this.gamepadIndex = e.gamepad.index;
  }

  handleGamepadDisconnected(e) {
    if (this.gamepadIndex === e.gamepad.index) {
      this.gamepadIndex = null;
    }
  }

  getInput() {
    let moveX = 0;
    let moveY = 0;
    let kick = false;
    let kickHeld = false;
    let tackle = false;
    let sprint = false;
    let aftertouchX = 0;
    let aftertouchY = 0;

    // Keyboard input - Arrow keys for movement
    if (this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['ArrowDown']) moveY += 1;
    if (this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['ArrowRight']) moveX += 1;

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const mag = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= mag;
      moveY /= mag;
    }

    // Action keys - kickStart on press, kickRelease on release for charge mechanic
    let kickStart = this.keysJustPressed['Space'];
    let kickRelease = this.keysJustReleased['Space'];
    kickHeld = this.keys['Space'];
    tackle = this.keysJustPressed['KeyX'];
    sprint = this.keys['ShiftLeft'] || this.keys['ShiftRight'];

    // Use movement direction for aftertouch while kick is held
    if (kickHeld) {
      aftertouchX = moveX;
      aftertouchY = moveY;
    }

    // Gamepad input (if connected)
    if (this.gamepadIndex !== null) {
      const gamepads = navigator.getGamepads();
      const gamepad = gamepads[this.gamepadIndex];

      if (gamepad) {
        // Left stick for movement
        const deadzone = 0.15;
        const lx = gamepad.axes[0];
        const ly = gamepad.axes[1];

        if (Math.abs(lx) > deadzone) moveX = lx;
        if (Math.abs(ly) > deadzone) moveY = ly;

        // Buttons - detect just pressed and just released
        const aPressed = gamepad.buttons[0]?.pressed;
        const bPressed = gamepad.buttons[1]?.pressed;

        if (aPressed && !this.prevGamepadButtons.a) kickStart = true;
        if (!aPressed && this.prevGamepadButtons.a) kickRelease = true;
        if (bPressed && !this.prevGamepadButtons.b) tackle = true;

        kickHeld = aPressed;
        this.prevGamepadButtons.a = aPressed;
        this.prevGamepadButtons.b = bPressed;

        // Right trigger or bumper for sprint
        if (gamepad.buttons[7]?.pressed || gamepad.buttons[5]?.pressed) sprint = true;

        // Right stick for aftertouch
        const rx = gamepad.axes[2] || 0;
        const ry = gamepad.axes[3] || 0;
        if (Math.abs(rx) > deadzone) aftertouchX = rx;
        if (Math.abs(ry) > deadzone) aftertouchY = ry;
      }
    }

    // Clear just pressed/released states after reading
    this.keysJustPressed = {};
    this.keysJustReleased = {};

    return {
      moveX,
      moveY,
      kickStart,
      kickRelease,
      kickHeld,
      tackle,
      sprint,
      aftertouchX,
      aftertouchY
    };
  }

  isKeyDown(code) {
    return !!this.keys[code];
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('gamepadconnected', this.handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected);
  }
}
