import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import GitHubIcon from '$lib/components/icons/GitHubIcon.svelte';
import GoogleIcon from '$lib/components/icons/GoogleIcon.svelte';
import LinkedInIcon from '$lib/components/icons/LinkedInIcon.svelte';
import XIcon from '$lib/components/icons/XIcon.svelte';

describe('brand icons', () => {
	const cases = [
		{ Icon: GitHubIcon, name: 'GitHubIcon', pathStart: 'M12' },
		{ Icon: GoogleIcon, name: 'GoogleIcon', pathStart: 'M12.48' },
		{ Icon: LinkedInIcon, name: 'LinkedInIcon', pathStart: 'M20.447' },
		{ Icon: XIcon, name: 'XIcon', pathStart: 'M18.901' }
	];

	it.each(cases)('$name renders an inheriting svg', ({ Icon, pathStart }) => {
		const { container } = render(Icon, { props: { class: 'size-4' } });
		const svg = container.querySelector('svg');
		expect(svg).not.toBeNull();
		expect(svg?.getAttribute('class')).toBe('size-4');
		expect(svg?.getAttribute('fill')).toBe('currentColor');
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
		const path = svg?.querySelector('path');
		expect(path?.getAttribute('d')?.startsWith(pathStart)).toBe(true);
	});
});
