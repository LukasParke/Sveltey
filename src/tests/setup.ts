import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// jsdom lacks IntersectionObserver; TableOfContents and others guard on it,
// but providing a stub keeps effects exercisable.
const intersectionInstances: {
	callback: (entries: { target: Element; isIntersecting: boolean }[]) => void;
	observe: (el: Element) => void;
	unobserve: (el: Element) => void;
	disconnect: () => void;
}[] = [];

class IntersectionObserverStub {
	callback: (entries: { target: Element; isIntersecting: boolean }[]) => void;
	observed: Element[] = [];
	constructor(cb: typeof IntersectionObserverStub.prototype.callback) {
		this.callback = cb;
		intersectionInstances.push(this);
	}
	observe(el: Element) {
		this.observed.push(el);
	}
	unobserve(el: Element) {
		this.observed = this.observed.filter((o) => o !== el);
	}
	disconnect() {
		this.observed = [];
	}
}

/** Fire the most recent observer's callback (for scroll-spy tests). */
export function fireIntersection(entries: { target: Element; isIntersecting: boolean }[]) {
	const last = intersectionInstances.at(-1);
	last?.callback(entries);
}

vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
vi.stubGlobal('__intersectionInstances', intersectionInstances);
