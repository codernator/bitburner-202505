import ObjectSet from '/lib/objectSet';
const statePort = 69420;

/** @param {NS} ns */
export default class StateMan {
  static createStateContainer() { return new ObjectSet(StateMan.serializeOne); }
  
  static createEntry(server, attackMode) {
    return ({ server, attackMode });  
  }
  
  static serialize(state) {
    return [...state].map(StateMan.serializeOne).join(',');
  }

	static deserialize(stateString) {
     const items = stateString.split(',').map(StateMan.deserializeOne); 
     const state = StateMan.createStateContainer();
     state.addMany(items);
     return state;
  };

  static serializeOne(element) {
    return `${element.server}:${element.attackMode}`
  }

  static deserializeOne(item) {
    const bits = item.split(':')
    return StateMan.createEntry(bits[0], bits[1]);
  }
  
  constructor(ns) {
    const state = ns.readPort(statePort);
    if (state === 'NULL PORT DATA') {
      this.state = StateMan.createStateContainer();
    } else {
      this.state = StateMan.deserialize(state);
      // need to put this back to ensure it remains persisted at all times.
      ns.writePort(statePort, state);
    }
  }

  clear(ns) {
    this.state = StateMan.createStateContainer();
    ns.clearPort(statePort);
  }
  
  save(ns) {
    ns.clearPort(statePort);
    if (this.state.size > 0)
      ns.writePort(statePort, StateMan.serialize(this.state));
  }

  track(ns, item) {
    this.state.add(item);
    this.save(ns);
  }

  untrack(ns, item) {
    this.state.remove(item);
    this.save(ns);
  }

  serialize() {
    return StateMan.serialize(this.state);
  }
}
