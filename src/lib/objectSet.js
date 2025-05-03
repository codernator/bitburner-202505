export default class ObjectSet {
	constructor(keyFunc) {
		this.items = {};
		this.counter = 0;
		this.keyFunc = keyFunc
	}

	static Test(ns) {
		const s = new ObjectSet(t => t.foo);
		s.add({ 'foo': 'yes' });
		s.add({ 'foo': 'no' });
		s.add({ 'foo': 'maybe' });
		s.add({ 'foo': 'yes' });
		s.add({ 'foo': 'no' });
		s.add({ 'foo': 'yes' });
		ns.tprint('keyFunc: t => t.foo');
		ns.tprint([...s]);	
	}


	*[Symbol.iterator]() {
		const keys = Object.keys(this.items);
		for (let index in keys) {
			const key = keys[index];
			yield this.items[key];
		}
	}	

	get count() { return this.counter; }

	fromKey(key) {
		return (this.items.hasOwnProperty(key))
			? this.items[key]
			: null;
	}

	has(item) {
		const key = this.keyFunc(item);
	    return this.items.hasOwnProperty(key);;
	}

	hasByKey(key) {
	    return this.items.hasOwnProperty(key);;
	}

	replace(item) {
		const key = this.keyFunc(item);
		if (!this.items.hasOwnProperty(key))
			this.counter++;

		this.items[key] = item;
		return this;
	}

	add(item) {
		const key = this.keyFunc(item);
		if (!this.items.hasOwnProperty(key)) {
			this.items[key] = item;
			this.counter++;
		}
		return this;
	}

	addMany(items) {
		if (!items)
			return;
		for (let i in items) {
			const item = items[i];
			this.add(item);
		}
		return this;
	}

	remove = function(item) {
		const key = this.keyFunc(item);
		if (this.items.hasOwnProperty(key)) {
			delete this.items[key];
			this.counter--;
		}
		return this;
	}

	removeByKey = function(key) {
		if (this.items.hasOwnProperty(key)) {
			delete this.items[key];
			this.counter--;
		}
		return this;
	}

	clear() {
		this.items = {};
		this.counter = 0;
		return this;
	}

	isEmpty() {
	    return this.counter === 0;
	}
};
