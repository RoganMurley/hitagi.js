export default class RoomSystem {
  constructor(world) {
    this._rooms = {};
    this._world = world;
  }

  saveRoom(roomName, entities) {
    const componentBatches = entities.map(entity => entity.c);
    this._rooms[roomName] = componentBatches;
  }

  loadRoom(roomName) {
    this._world.clear()
    this._world.load(this._rooms[roomName]);
  }
}
