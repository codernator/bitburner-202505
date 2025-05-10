import { allPorts } from './constants';
import ObjectSet from '/lib/objectSet';
const statePort = allPorts.stateCache.statePort;

const createCacheItem = (value, cacheTime, expiration) => ({
    value,
    cacheTime,
    expiration,
});

const elementKeyFunc = element => JSON.stringify(element.value);
const valueKeyFunc = value => JSON.stringify(value);
export default class StateCache {
    static serialize(state) {
        return JSON.stringify([...state]);
    }

	static deserialize(stateString) {
         const items = JSON.parse(stateString);
         const state = new ObjectSet(elementKeyFunc);
         state.addMany(items);
         return state;
    };

    static createDefaultPersistFunc(ns) {
        return state => ns.writePort(statePort, StateCache.serialize([...state]));
    }

    static createDefaultUnPersistFunc(ns) {
        return () => {
            const stateString = ns.readPort(statePort);
            if (stateString === 'NULL PORT DATA')
                return new ObjectSet(elementKeyFunc);

            const items = JSON.parse(stateString);
            const state = new ObjectSet(elementKeyFunc);
            state.addMany(items);
            return state;
        };
    }

    constructor(getPersistedFunc, persistFunc) {
        this.getPersistedFunc = getPersistedFunc;
        this.persistFunc = persistFunc;

        this.state = this.getPersistedFunc();
        // need to put this back to ensure it remains persisted at all times.
        this.persistFunc(this.state);
    }

    has(value) {
        return this.state.hasByKey(valueKeyFunc(value));
    }

    track(value, duration) {
        const cacheTime = new Date();
        const expiration = new Date(cacheTime);
        expiration.setMilliseconds(expiration.getMilliseconds() + duration)

        const element = createCacheItem(value, cacheTime, expiration);
        this.state.add(element);
        this.persistFunc(this.state);
    }

    untrack(value) {
        this.state.removeByKey(valueKeyFunc(value));
        this.persistFunc(this.state);
    }

    invalidate() {
        const time = new Date();
        const expired = [...this.state].filter(e => e.expiration <= time);
        for (let element of expired) {
            this.state.remove(element);
        }
        this.persistFunc(this.state);
    }

    serialize() {
        return JSON.stringify([...this.state]);
    }

    save() {
        this.persistFunc(this.state);
    }
}

function assert(ns, test, data, conditionFunc) {
    const result = conditionFunc(data);
    ns.tprint(`${test}: ${(result ? 'PASS' : 'FAIL')}`);
    if (!result)
        ns.tprint({ data });
}

export function unitTests(ns) {
    persistOne();
    expireOne();
    expireTwo();
    hasSimple();
    hasComplex();

    function persistOne() {
        let persisted = new ObjectSet(elementKeyFunc);
        const unpersistFunc = () => persisted;
        const persistFunc = state => persisted = state;

        const cache = new StateCache(unpersistFunc, persistFunc);
        assert(ns, 'persistOne (create)', persisted, x => x !== null && Object.keys(x.items).length === 0);

        cache.track(123, 10_000);
        assert(ns, 'persistOne (create)', persisted, x => x !== null && Object.keys(x.items).length === 1 && persisted.hasByKey('123'));
    }

    function expireOne() {
        let persisted = new ObjectSet(elementKeyFunc);
        const unpersistFunc = () => persisted;
        const persistFunc = state => persisted = state;

        const cache = new StateCache(unpersistFunc, persistFunc);
        assert(ns, 'expireOne (create)', persisted, x => x !== null && Object.keys(x.items).length === 0);

        cache.track(123, 0);
        assert(ns, 'expireOne (track)', persisted, x => x !== null && Object.keys(x.items).length === 1 && persisted.hasByKey('123'));

        cache.invalidate();
        assert(ns, 'expireOne (invalidate)', persisted, x => x !== null && Object.keys(x.items).length === 0);
    }

    function expireTwo() {
        let persisted = new ObjectSet(elementKeyFunc);
        const unpersistFunc = () => persisted;
        const persistFunc = state => persisted = state;

        const cache = new StateCache(unpersistFunc, persistFunc);
        assert(ns, 'expireTwo (create)', persisted, x => x !== null && Object.keys(x.items).length === 0);

        cache.track(123, 0);
        cache.track(456, 10_000);
        assert(ns, 'expireTwo (track)', persisted, x => x !== null && Object.keys(x.items).length === 2 && persisted.hasByKey('123') && persisted.hasByKey('456'));

        cache.invalidate();
        assert(ns, 'expireTwo (invalidate)', persisted, x => x !== null && Object.keys(x.items).length === 1 && persisted.hasByKey('456'));
    }

    function hasSimple() {
        let persisted = new ObjectSet(elementKeyFunc);
        const unpersistFunc = () => persisted;
        const persistFunc = state => persisted = state;

        const cache = new StateCache(unpersistFunc, persistFunc);
        const value = 123;
        cache.track(value, 0);
        const actual = cache.has(value);
        assert(ns, 'has simple', cache, () => actual);
    }

    function hasComplex() {
        let persisted = new ObjectSet(elementKeyFunc);
        const unpersistFunc = () => persisted;
        const persistFunc = state => persisted = state;

        const cache = new StateCache(unpersistFunc, persistFunc);
        const value = { s: 's', k: 123 };
        cache.track(value, 0);
        const actual = cache.has(value);
        assert(ns, 'has complex', cache, () => actual);
    }
}
