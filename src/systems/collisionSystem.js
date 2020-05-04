import _ from 'lodash';


export default class CollisionSystem {
  constructor() {
    this.$tracking = {
      collision: 'many',
    };
  }

  // Prospective collision test.
  // Tests for a collision between entity and any
  // entity with otherComponent.
  collide(entity, otherComponent, params) {
    return _.filter(this.$tracked.collision, (other) => {
      return (
        (other.uid !== entity.uid) &&
        other.has(otherComponent) &&
        this.hitTestAABB(entity, other, params)
      );
    });
  }

  resolutionVector(entity, other, params) {
    const {x1, y1, x2, y2} = this.anchoredPositions(entity, other, params);
    let dirX, dirY;

    if (x2 - x1 < 0) {
      dirX = -1;
    } else {
      dirX = 1;
    }
    if (y2 - y1 < 0) {
      dirY = -1;
    } else {
      dirY = 1;
    }

    const {collision} = entity.c;
    const otherCollision = other.c.collision;
    const minApart = {
      x: (collision.width + otherCollision.width) / 2,
      y: (collision.height + otherCollision.height) / 2,
    };

    const actualDisplacement = {
      x: Math.abs(x1 - x2),
      y: Math.abs(y1 - y2),
    };

    const overlap = {
      x: actualDisplacement.x - minApart.x,
      y: actualDisplacement.y - minApart.y,
    };

    if (overlap.x > overlap.y ) {
      return {
        x: dirX * overlap.x,
        y: 0,
      };
    }
    else if (overlap.x < overlap.y ) {
      return {
        x: 0,
        y: dirY * overlap.y,
      };
    }
    else { //if(overlap.x == overlap.y)
      return {
        x: dirX * overlap.x,
        y: dirY * overlap.y,
      };
    }
  }

  hitTestAABB(entity, other, params) {
    const {x1, y1, x2, y2} = this.anchoredPositions(entity, other, params);
    const {collision} = entity.c;
    const otherCollision = other.c.collision;
    const width = (collision.width + otherCollision.width) / 2;
    const height = (collision.height + otherCollision.height) / 2;

    if (x1 + width > x2) {
      if (x1 < x2 + width) {
        if (y1 + height > y2) {
          if (y1 < y2 + height) {
            return true;
          }
        }
      }
    }
    return false;
  }

  anchoredPositions(entity, other, params) {
    params = {
      x: entity.c.position.x,
      y: entity.c.position.y,
      ...params,
    };

    var result = {
      x1: params.x,
      y1: params.y,
      x2: other.c.position.x,
      y2: other.c.position.y,
    };

    const {collision} = entity.c;
    const otherCollision = other.c.collision;

    result.x1 -= (collision.anchor.x - 0.5) * collision.width;
    result.y1 -= (collision.anchor.y - 0.5) * collision.height;

    result.x2 -= (otherCollision.anchor.x - 0.5) * otherCollision.width;
    result.y2 -= (otherCollision.anchor.y - 0.5) * otherCollision.height;

    return result;
  }
}
