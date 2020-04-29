export function delta(speed, dt) {
    return speed * (dt / 1000);
}


// Proxy a property, simillar to the proxy in ES6.
// Allows us to propagate changes to the target property.
export function proxy(originalObj, originalProp, targetObj, targetProp) {
    Object.defineProperty(
        originalObj,
        originalProp,
        {
            get: () => targetObj[targetProp],
            set: (newValue) => {
                targetObj[targetProp] = newValue;
            },
        },
    );
}


// A read-only version of proxy, see above.
export function readOnlyProxy(originalObj, originalProp, targetObj, targetProp) {
    Object.defineProperty(
        originalObj,
        originalProp,
        {
            get: () => targetObj[targetProp],
            set: () => {
                console.error(`${targetProp} is read-only.`);
                throw new Error('ReadOnly');
            },
        },
    );
}


// Watches a property, executing a callback when the property changes.
export function look(obj, prop, callback, callbackParams) {
    let value = obj[prop];
    Object.defineProperty(obj, prop, {
        get: () => value,
        set: (newValue) => {
            value = newValue;
            callback(newValue, callbackParams);
        },
    });
}
