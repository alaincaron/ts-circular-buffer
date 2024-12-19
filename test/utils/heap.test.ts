import { expect } from 'chai';
import { Heap, heapify, isHeap } from '../../src';

describe('Heap', () => {
  it('should heapify array', () => {
    const a = Array.from({ length: 250 }, (_, i) => i);
    a.shuffle();
    expect(isHeap(a)).to.be.false;
    heapify(a);
    expect(isHeap(a)).to.be.true;
  });

  it('should remove elements in the right order', () => {
    const a = Array.from({ length: 250 }, (_, i) => i);
    a.shuffle();
    const h = new Heap(a);
    expect(h.isHeap()).to.be.true;
    for (let i = 0; i < 250; ++i) {
      expect(h.remove()).equal(i);
      expect(a.length).equal(250 - i - 1);
    }
    expect(h.remove()).to.be.undefined;
  });

  it('should add items while maintaining heap property', () => {
    const a = Array.from({ length: 250 }, (_, i) => i);
    a.shuffle();
    const h = new Heap();
    expect(h.isHeap()).to.be.true;
    for (const item of a) {
      h.insert(item);
      expect(h.isHeap()).to.be.true;
    }
    expect(isHeap(h.data)).to.be.true;
  });
});