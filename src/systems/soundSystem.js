import _ from 'lodash';
import Howler from 'howler';


export default class SoundSystem {
  constructor() {
    this._sounds = {};
    this.volume = 1; // Between 0 and 1.
  }

  load(path) {
    this._sounds[path] = new Howler.Howl({urls: [path]});
    return this._sounds[path];
  }

  play(path) {
    if (!_.has(this._sounds, path)) {
      this.load(path);
    }
    this._sounds[path]._volume = this.volume;
    this._sounds[path].play();
  }
}
