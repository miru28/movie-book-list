import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';

import { ItemsService } from '../../../core/library/items.service';
import { Item } from '../../../core/library/item.model';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { RatingComponent } from '../../../shared/components/rating/rating.component';
import { ItemFormComponent } from '../../../shared/components/item-form/item-form.component';
import { ReviewFormComponent } from '../../../shared/components/review-form/review-form.component';

import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, startWith, map } from 'rxjs';

type SortKey = keyof Pick<
  Item,
  'title' | 'kind' | 'creator' | 'length' | 'year' | 'rating'
>;
type SortOrder = 'ascend' | 'descend' | null;

@Component({
  standalone: true,
  selector: 'app-list',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    NzPopconfirmModule,
    NzIconModule,
    RatingComponent,
    ItemFormComponent,
    ReviewFormComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  private itemsSvc = inject(ItemsService);

  search = new FormControl<string>('', { nonNullable: true });

  searchTerm = toSignal(
    this.search.valueChanges.pipe(
      startWith(this.search.value),
      debounceTime(200),
      distinctUntilChanged(),
      map((v) => (v || '').toLowerCase().trim()),
    ),
    { initialValue: '' },
  );

  sortKey = signal<SortKey | null>(null);
  sortOrder = signal<SortOrder>(null);

  itemModalOpen = false;
  editing: Item | null = null;

  reviewModalOpen = false;
  reviewEditing: Item | null = null;

  trackId = (_: number, it: Item): number => it.id;

  data = computed(() => {
    const term = this.searchTerm();
    let arr = this.itemsSvc.items();

    if (term) {
      arr = arr.filter(
        (i) =>
          i.title.toLowerCase().includes(term) ||
          i.creator.toLowerCase().includes(term) ||
          i.kind.toLowerCase().includes(term) ||
          String(i.year).includes(term),
      );
    }

    const key = this.sortKey();
    const order = this.sortOrder();

    if (key && order) {
      arr = [...arr].sort((a, b) => {
        const av = a[key],
          bv = b[key];
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
        return order === 'ascend' ? cmp : -cmp;
      });
    }

    return arr;
  });

  openAdd() {
    this.editing = null;
    this.itemModalOpen = true;
  }
  openEdit(it: Item) {
    this.editing = it;
    this.itemModalOpen = true;
  }
  saveItem(payload: Omit<Item, 'id'>) {
    console.log('[List] saveItem', this.editing?.id ?? '(new)', payload);
    if (this.editing) this.itemsSvc.update(this.editing.id, payload);
    else this.itemsSvc.add(payload);
    this.itemModalOpen = false;
  }
  delete(it: Item) {
    console.log('[List] delete', it.id);
    this.itemsSvc.remove(it.id);
  }

  updateRating(it: Item, rating: number) {
    console.log('[List] updateRating', it.id, rating);
    this.itemsSvc.setRating(it.id, rating);
  }

  openReview(it: Item) {
    this.reviewEditing = it;
    this.reviewModalOpen = true;
  }
  saveReview(payload: { text: string; rating?: number } | string) {
    if (!this.reviewEditing) return;
    const text = typeof payload === 'string' ? payload : (payload.text ?? '');
    const rating = typeof payload === 'string' ? undefined : payload.rating;
    console.log('[List] saveReview', this.reviewEditing.id, { text, rating });

    this.itemsSvc.setReview(this.reviewEditing.id, text);
    if (typeof rating === 'number')
      this.itemsSvc.setRating(this.reviewEditing.id, rating);
    this.reviewModalOpen = false;
  }

  onSort(column: SortKey, order: string | null) {
    const normalized: 'ascend' | 'descend' | null =
      order === 'ascend' || order === 'descend' ? order : null;

    this.sortKey.set(normalized ? column : null);
    this.sortOrder.set(normalized);
  }
}
