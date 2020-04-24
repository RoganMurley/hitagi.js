import _ from 'lodash';


class KeyState {
  constructor() {
    this.active = false;
    this.held = false;
  }

  updateHeld() {
    if (this.active) {
      this.held = true;
    }
  };

  press() {
    this.active = true;
  };

  release() {
    this.active = false;
    this.held = false;
  };
};


export default class ControlsSystem {
  constructor() {
    this._keys = {};
    this._mousePos = { x: 0, y: 0};
    this._bindings = {};
    this._mouseMappings = {
      1: 'm1',
      2: 'm2',
      3: 'm3',
    };

    // Listen for input.
    document.onkeydown = (e) => {
      const code = e.which;
      if (_.has(this._keys, code)) {
        this._keys[code].press();
        return false; // Prevent default.
      }
    };

    document.onkeyup = (e) => {
      const code = e.which;
      if (_.has(this._keys, code)) {
        this._keys[code].release();
        return false; // Prevent default.
      }
    };

    document.onmousedown = (e) => {
      const code = this._mouseMappings[e.which];
      if (_.has(this._keys, code)) {
        this._keys[code].press();
        return false; // Prevent default.
      }
    };

    document.onmouseup = (e) => {
      const code = this._mouseMappings[e.which];
      if (_.has(this._keys, code)) {
        this._keys[code].release();
        return false; // Prevent default.
      }
    };

    // Update mouse position.
    document.onmousemove = (e) => {
      this._mousePos.x = e.offsetX;
      this._mousePos.y = e.offsetY;
    };

    // Disable context menu, so we can right click.
    window.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };
  }

  getMousePos() {
    return this._mousePos;
  }

  // Add a binding.
  bind(code, name) {
    if (_.has(this._bindings, name)) {
      console.error(`${name} already bound.`);
      throw new Error('ControlAlreadyBound');
    }
    this._bindings[name] = code;
    this._keys[code] = new KeyState();
  }

  // Remove a binding.
  unbind() {
    if (!_.has(this._bindings, name)) {
      console.error(`${name} not bound.`);
      throw new Error('ControlNotBound');
    }
    const code = this._bindings[name];
    delete this._bindings[name];
    delete this._keys[code];
  }

  // Check that a key binding has been pressed.
  // Options: once
  // If once is true, only check for the press..
  check(binding, options) {
    const keyCode = this._bindings[binding];
    const key = this._keys[keyCode];
    if (options && options.once) {
      return key.active && !key.held;
    }
    return key.active;
  }

  tickEnd() {
    _.each(this._keys, key => {
      key.updateHeld();
    });
  }
}
