export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastInput {
	type?: ToastType;
	title: string;
	description?: string;
	/** ms before auto-dismiss; defaults to 5000 */
	duration?: number;
}

export interface Toast extends ToastInput {
	id: string;
	type: ToastType;
}

const DEFAULT_DURATION = 5000;
const MAX_VISIBLE = 4;

class ToasterStore {
	toasts = $state<Toast[]>([]);
	#seq = 0;

	create(input: ToastInput): string {
		const id = `toast-${++this.#seq}`;
		const toast: Toast = {
			id,
			type: input.type ?? 'info',
			title: input.title,
			description: input.description,
			duration: input.duration ?? DEFAULT_DURATION
		};
		this.toasts.push(toast);
		// Keep the newest toasts; drop the oldest beyond the cap.
		if (this.toasts.length > MAX_VISIBLE) {
			this.toasts.splice(0, this.toasts.length - MAX_VISIBLE);
		}
		setTimeout(() => this.dismiss(id), toast.duration);
		return id;
	}

	dismiss(id: string): void {
		const index = this.toasts.findIndex((t) => t.id === id);
		if (index !== -1) this.toasts.splice(index, 1);
	}
}

export const toaster = new ToasterStore();
