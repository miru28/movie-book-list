import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Item, ItemKind } from '../../../core/library/item.model';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    RatingComponent,
  ],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss',
})
export class ItemFormComponent {
  private fb = inject(FormBuilder);

  @Input() initial: Item | null = null;
  @Output() save = new EventEmitter<Omit<Item, 'id'>>();
  @Output() cancel = new EventEmitter<void>();

  kinds: ItemKind[] = ['book', 'movie'];

  form = this.fb.group({
    title: ['', Validators.required],
    kind: ['book' as ItemKind, Validators.required],
    creator: ['', Validators.required],
    length: [1, [Validators.required, Validators.min(1)]],
    year: [
      2000,
      [
        Validators.required,
        Validators.min(1800),
        Validators.max(new Date().getFullYear()),
      ],
    ],
    rating: [0, [Validators.min(0), Validators.max(5)]],
  });

  ngOnChanges() {
    if (this.initial) {
      const { id, ...rest } = this.initial;
      this.form.patchValue(rest as any);
    }
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value as any;
    const payload: Omit<Item, 'id'> = {
      title: raw.title,
      kind: raw.kind,
      creator: raw.creator,
      length: Number(raw.length),
      year: Number(raw.year),
      rating: Number(raw.rating ?? 0),
      review: raw.review ?? undefined,
    };

    this.save.emit(payload);
  }
}
