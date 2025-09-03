import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { Item } from '../../../core/library/item.model';
import { RatingComponent } from '../rating/rating.component';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    NzButtonModule,
    RatingComponent,
  ],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss',
})
export class ReviewFormComponent {
  private fb = inject(FormBuilder);

  @Input() initial: Item | null = null;
  @Output() save = new EventEmitter<{ text: string; rating: number }>();
  @Output() cancel = new EventEmitter<void>();

  form = this.fb.group({
    text: ['', [Validators.required, Validators.minLength(5)]],
    rating: [0, [Validators.min(0), Validators.max(5)]],
  });

  ngOnChanges() {
    if (this.initial) {
      this.form.patchValue({
        text: this.initial.review ?? '',
        rating: this.initial.rating ?? 0,
      });
    } else {
      this.form.reset({ text: '', rating: 0 });
    }
  }

  onSave() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value as { text: string; rating: number };
    this.save.emit(v);
  }
}
