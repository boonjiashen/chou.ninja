export class Supplier {
  get() {
    throw "MethodNotImplementedException";
  }
}

export class ExpressionsSupplier extends Supplier {

  _selectionGetter = function() {};
  _selection2range = new Map();
  _Class = Object;

  constructor(selectionGetter, selection2range, Class) {
    super();
    this._selectionGetter = selectionGetter;
    this._selection2range = selection2range;
    this._Class = Class;
  }

  get() {
    const selection = this._selectionGetter();
    const constructorArgsList = this._selection2range.get(selection);

    return constructorArgsList.map(constructorArgs =>
      new this._Class(constructorArgs)
    );
  }
}

// Given List<Supplier<List>>, get() calls the suppliers and concatenates their returned lists
export class ConcatenatedListSupplier extends Supplier {
  #listSuppliers = [];

  constructor(listSuppliers) {
    super();
    this.#listSuppliers = listSuppliers;
  }

  get() {
    const listOfLists = this.#listSuppliers.map(listSupplier => listSupplier.get());

    return [].concat(...listOfLists);
  }
}
