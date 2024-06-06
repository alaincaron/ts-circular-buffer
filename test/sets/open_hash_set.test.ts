import { expect } from 'chai';
import { Generators } from 'ts-fluent-iterators';
import { OpenHashSet, OverflowException } from '../../src';

describe('OpenHashSet', () => {
  describe('constructor', () => {
    it('should have infinite capacity as per default ctor', () => {
      const set = new OpenHashSet();
      expect(set.capacity()).equal(Infinity);
      expect(set.size()).equal(0);
      expect(set.remaining()).equal(Infinity);
      expect(set.isEmpty()).to.be.true;
      expect(set.isFull()).to.be.false;
    });

    it('should have specified capacity', () => {
      const set = OpenHashSet.create({ capacity: 2 });
      expect(set.capacity()).equal(2);
      expect(set.size()).equal(0);
      expect(set.remaining()).equal(2);
      expect(set.isEmpty()).to.be.true;
      expect(set.isFull()).to.be.false;
    });

    it('should have the same elements as the array argument', () => {
      const arr = [1, 2];
      const set = OpenHashSet.create({ capacity: 2, initial: arr });
      expect(set.capacity()).equal(2);
      expect(set.size()).equal(2);
      expect(set.remaining()).equal(0);
      expect(set.isEmpty()).to.be.false;
      expect(set.isFull()).to.be.true;
      expect(set.toArray().sort()).to.deep.equal(arr);
    });

    it('should be identical to the OpenHashSet argument', () => {
      const arr = [1, 2];
      const set1 = OpenHashSet.create({ capacity: 3, initial: arr });
      expect(set1.capacity()).equal(3);
      const set2 = OpenHashSet.create({ initial: set1 });
      expect(set2.capacity()).equal(3);
      expect(set2.toArray().sort()).to.deep.equal(set1.toArray().sort());
    });

    it('should be identical to the Collection argument', () => {
      const arr = [1, 2];
      const set1 = OpenHashSet.create({ initial: arr });
      const set2 = OpenHashSet.create({ initial: set1 });
      expect(set2.capacity()).equal(Infinity);
      expect(set2.toArray().sort()).to.deep.equal(arr);
    });

    it('should use the function provided in the ArrayGenerator', () => {
      const arr = Array.from({ length: 2 }, (_, i) => i + 1);
      const set = OpenHashSet.create({ initial: { length: arr.length, seed: i => i + 1 } });
      expect(set.toArray().sort()).to.deep.equal(arr);
    });

    it('should use the iterator provided in the ArrayGenerator', () => {
      const set = OpenHashSet.create({ initial: { length: 10, seed: Generators.range() } });
      expect(set.size()).equal(10);
      expect(set.toArray().sort()).to.deep.equal(Array.from({ length: 10 }, (_, i) => i));
    });

    it('should use the iterable provided in the ArrayGenerator', () => {
      const arr = Array.from({ length: 2 }, (_, i) => i);
      const set = OpenHashSet.create({ initial: { length: 10, seed: arr } });
      expect(set.size()).equal(2);
      expect(set.toArray().sort()).to.deep.equal(arr);
    });

    it('should throw if number of initial elements exceed capacity', () => {
      expect(() => OpenHashSet.create({ capacity: 0, initial: { length: 10, seed: i => i + 1 } })).to.throw(
        OverflowException
      );
    });
  });

  describe('add', () => {
    it('should return false if element already present', () => {
      const set = new OpenHashSet();
      expect(set.add(1)).to.be.true;
      expect(set.add(1)).to.be.false;
      expect(set.add(2)).to.be.true;
      expect(set.add(2)).to.be.false;
      expect(set.size()).equal(2);
      expect(set.toArray().sort()).to.deep.equal([1, 2]);
    });
    it('should throw if full and element not present', () => {
      const set = OpenHashSet.create({ capacity: 1 });
      expect(set.add(1)).to.be.true;
      expect(set.isFull()).to.be.true;
      expect(set.add(1)).to.be.false;
      expect(() => set.add(2)).to.throw(OverflowException);
      expect(set.size()).equal(1);
    });
  });

  describe('offer', () => {
    it('should refuse if full and element not present', () => {
      const set = OpenHashSet.create({ capacity: 1 });
      expect(set.offer(1)).to.be.true;
      expect(set.offer(2)).to.be.false;
      expect(set.isFull()).to.be.true;
      expect(set.offer(1)).to.be.true;
      expect(set.size()).equal(1);
      expect(set.isFull()).to.be.true;
    });
  });

  describe('clone', () => {
    it('should create a deep equal copy', () => {
      const a = new OpenHashSet();
      const b = a.clone();
      expect(b).to.deep.equal(a);
      b.add('foo');
      expect(b.size()).equal(1);
      expect(a.size()).equal(0);
    });
  });

  describe('clear', () => {
    it('should clear the content', () => {
      const set = OpenHashSet.create({ capacity: 3, initial: { length: 2, seed: (i: number) => i } });
      expect(set.size()).to.equal(2);
      expect(set.remaining()).to.equal(1);
      set.clear();
      expect(set.size()).to.equal(0);
      expect(set.remaining()).to.equal(3);
      expect(set.toArray()).to.deep.equal([]);
    });
  });

  describe('contains', () => {
    it('should return false on empty set', () => {
      const set = new OpenHashSet();
      expect(set.contains('foo')).to.be.false;
    });
    it('should return false if absent', () => {
      const set = OpenHashSet.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(set.contains(10)).to.be.false;
    });
    it('should return true if present', () => {
      const set = OpenHashSet.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(set.contains(9)).to.be.true;
    });
  });

  describe('find', () => {
    it('should return undefined on empty set', () => {
      const set = new OpenHashSet();
      expect(set.find(x => x === 'foo')).to.be.undefined;
    });
    it('should return undefined if no match', () => {
      const set = OpenHashSet.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(set.find(x => x >= 10)).to.be.undefined;
    });
    it('should return the first item matching the predicate', () => {
      const set = OpenHashSet.create({ initial: { length: 10, seed: (i: number) => i } });
      expect(set.find(x => x >= 5)).to.be.greaterThanOrEqual(5);
    });
  });

  describe('removeItem', () => {
    it('should return false on empty set', () => {
      const set = new OpenHashSet();
      expect(set.removeItem(1)).to.be.false;
      expect(set.isEmpty()).to.be.true;
      expect(set.size()).equal(0);
    });
    it('should return false if item is missing', () => {
      const arr = [1, 2, 3];
      const set = OpenHashSet.create({ initial: arr });
      expect(set.removeItem(4)).to.be.false;
      expect(set.isEmpty()).to.be.false;
      expect(set.size()).equal(3);
    });
    it('should remove occurence and return true if item is present', () => {
      const arr = [1, 0, 2, 0, 3];
      const set = OpenHashSet.create({ initial: arr });
      expect(set.toArray().sort()).to.deep.equal([0, 1, 2, 3]);
      expect(set.removeItem(0)).to.be.true;
      expect(set.isEmpty()).to.be.false;
      expect(set.size()).equal(3);
      expect(set.toArray().sort()).deep.equal([1, 2, 3]);
    });
  });

  describe('filter', () => {
    it('should return 0 on empty set', () => {
      const set = new OpenHashSet();
      expect(set.filter(i => i === 0)).equal(0);
      expect(set.isEmpty()).to.be.true;
      expect(set.size()).equal(0);
    });

    it('should return 0 if all items match the predicate', () => {
      const arr = [1, 2, 3];
      const set = OpenHashSet.create({ initial: arr });
      expect(set.filter(i => i > 0)).equal(0);
      expect(set.isEmpty()).to.be.false;
      expect(set.size()).equal(3);
    });
    it('should remove all items not matching the filter', () => {
      const arr = [1, 0, 2, -1, 3];
      const set = OpenHashSet.create({ initial: arr });
      expect(set.filter(i => i > 0)).equal(2);
      expect(set.isEmpty()).to.be.false;
      expect(set.size()).equal(3);
      expect(set.toArray().sort()).deep.equal([1, 2, 3]);
    });
  });

  describe('offerFully', () => {
    it('should refuse all the items if not enough capacity remaining', () => {
      const set = OpenHashSet.create({ capacity: 2 });
      const data = [1, 2, 3];
      expect(set.offerFully(data)).equal(0);
      expect(set.isEmpty()).to.be.true;
      expect(set.offerFully(OpenHashSet.create({ initial: data }))).equal(0);
      expect(set.isEmpty()).to.be.true;
    });
    it('should accept all items if enough capacity remaining', () => {
      const set = OpenHashSet.create({ capacity: 6 });
      const data = [1, 2, 3, 1, 3, 2];
      expect(set.offerFully(data)).equal(3);
      expect(set.size()).equal(3);
      expect(set.offerFully(OpenHashSet.create({ initial: [1, 2, 3, 4, 5, 6] }))).equal(3);
      expect(set.size()).equal(6);
    });
    it('should accept all the items if there is enough capacity remaining for distinct elements', () => {
      const set = OpenHashSet.create({ capacity: 2 });
      const data = [1, 2, 1, 2];
      expect(set.offerFully(data)).equal(2);
      expect(set.isEmpty()).to.be.false;
      expect(set.size()).equal(2);
    });
  });

  describe('offerPartially', () => {
    it('should accept elements up to the remaining capacity', () => {
      const set = OpenHashSet.create({ capacity: 2 });
      const data = [1, 2, 3];
      expect(set.offerPartially(data)).equal(2);
      expect(set.toArray().sort()).to.deep.equal([1, 2]);
    });
    it('should accept all items if enough capacity remaining', () => {
      const set = OpenHashSet.create({ capacity: 6 });
      const data = [1, 1, 2, 2, 3, 4, 5];
      expect(set.offerPartially(data)).equal(5);
      expect(set.size()).equal(5);
      expect(set.offerPartially(OpenHashSet.create({ initial: data }))).equal(0);
      expect(set.size()).equal(5);
    });
    it('should accept all the items if there is enough capacity remaining for distinct elements', () => {
      const set = OpenHashSet.create({ capacity: 2 });
      const data = [1, 1, 1, 2, 1, 2, 3, 4];
      expect(set.offerPartially(data)).equal(2);
      expect(set.isEmpty()).to.be.false;
      expect(set.size()).equal(2);
      expect(set.toArray().sort()).to.deep.equal([1, 2]);
    });
  });

  describe('toJSON', () => {
    it('should return the JSON string', () => {
      const set = OpenHashSet.create({ initial: [1, 2, 3, 4, { x: true }, 'alain'] });
      const set2 = OpenHashSet.create({ initial: JSON.parse(set.toJSON()) });
      expect(set.equals(set2)).to.be.true;
    });
  });
});
