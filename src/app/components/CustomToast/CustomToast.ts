import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/Toast.service';

@Component({
  selector: 'custom-toast',
  imports: [],
  templateUrl: './CustomToast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomToast {
  toastService = inject(ToastService);
}
