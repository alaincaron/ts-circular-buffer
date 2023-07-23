import { UnderflowException } from '../utils';
import { AbstractQueue } from '../queues';
import { Stack } from './stack';

export abstract class AbstractStack<E> extends AbstractQueue<E> implements Stack<E> {
  push(item: E) {
    this.add(item);
  }

  tryPush(item: E): boolean {
    return this.offer(item);
  }

  pop(): E {
    return this.remove();
  }

  trySwap(): boolean {
    if (this.size() >= 2) {
      const a = this.pop();
      const b = this.pop();
      this.push(a);
      this.push(b);
      return true;
    }
    return false;
  }

  swap() {
    if (!this.trySwap()) throw new UnderflowException('Need at least two elements for a swap');
  }

  abstract clone(): AbstractStack<E>;
}