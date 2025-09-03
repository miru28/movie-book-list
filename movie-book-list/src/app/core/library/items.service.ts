import { Injectable, computed, signal, effect } from '@angular/core';
import { Item } from './item.model';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private static __instanceCount = 0;

  private _items = signal<Item[]>([
    {
      id: 1,
      title: 'Inception',
      kind: 'movie',
      creator: 'Christopher Nolan',
      length: 148,
      year: 2010,
      rating: 5,
      review: 'Mind-bending.',
    },
    {
      id: 2,
      title: 'The Pragmatic Programmer',
      kind: 'book',
      creator: 'Andrew Hunt',
      length: 352,
      year: 1999,
      rating: 4,
      review: null,
    },
    {
      id: 3,
      title: 'Interstellar',
      kind: 'movie',
      creator: 'Christopher Nolan',
      length: 169,
      year: 2014,
      rating: 5,
      review: null,
    },
    {
      id: 4,
      title: 'Clean Code',
      kind: 'book',
      creator: 'Robert C. Martin',
      length: 464,
      year: 2008,
      rating: 4,
      review: 'Classic.',
    },
  ]);

  items = computed(() => this._items());

  constructor() {
    console.log('[ItemsService] instance #', ++ItemsService.__instanceCount);

    try {
      const saved = localStorage.getItem('items');
      if (saved) this._items.set(JSON.parse(saved));
    } catch {}

    effect(() => {
      const arr = this._items();
      console.log('[ItemsService] items changed', arr);
      localStorage.setItem('items', JSON.stringify(arr));
    });
  }

  add(item: Omit<Item, 'id'>) {
    const id = Math.max(0, ...this._items().map((i) => i.id)) + 1;
    const next = [...this._items(), { id, ...item }];
    console.log('[ItemsService] add', next[next.length - 1]);
    this._items.set(next);
  }

  update(id: number, patch: Partial<Item>) {
    console.log('[ItemsService] update', id, patch);
    this._items.update((arr) =>
      arr.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  }

  remove(id: number) {
    console.log('[ItemsService] remove', id);
    this._items.update((arr) => arr.filter((i) => i.id !== id));
  }

  setRating(id: number, rating: number) {
    console.log('[ItemsService] setRating', id, rating);
    this.update(id, { rating });
  }

  setReview(id: number, review: string | null) {
    console.log('[ItemsService] setReview', id, review);
    this.update(id, { review });
  }

  byId(id: number) {
    return this._items().find((i) => i.id === id) || null;
  }
}
