import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { describe, it, expect } from 'vitest';

describe('Tailwind CSS Integration', () => {
	const appCssPath = join(process.cwd(), 'src', 'app.css');

	// Test that Tailwind CSS is imported correctly
	it('should have @import "tailwindcss" in app.css', () => {
		expect(existsSync(appCssPath)).toBe(true);
		const cssContent = readFileSync(appCssPath, 'utf-8');

		// Check that the main Tailwind import exists
		expect(cssContent).toContain('@import "tailwindcss"');
	});

	// Test that @theme block exists with custom properties
	it('should have @theme block with custom CSS variables', () => {
		expect(existsSync(appCssPath)).toBe(true);
		const cssContent = readFileSync(appCssPath, 'utf-8');

		// Check that @theme block exists
		expect(cssContent).toContain('@theme');

		// Check for custom font definitions
		expect(cssContent).toContain('--font-sans');
		expect(cssContent).toContain('--font-mono');
	});

	// Test that custom component classes exist
	it('should have custom component classes from app.css', () => {
		expect(existsSync(appCssPath)).toBe(true);
		const cssContent = readFileSync(appCssPath, 'utf-8');

		// Check for custom component classes
		expect(cssContent).toContain('.btn');
		expect(cssContent).toContain('.btn-primary');
		expect(cssContent).toContain('.input-field');
		expect(cssContent).toContain('.card');
	});

	// Test CSS custom properties are defined
	it('should define CSS custom properties for theming', () => {
		expect(existsSync(appCssPath)).toBe(true);
		const cssContent = readFileSync(appCssPath, 'utf-8');

		// Check for CSS custom properties
		expect(cssContent).toContain('--bg:');
		expect(cssContent).toContain('--fg:');
		expect(cssContent).toContain('--accent:');

		// Check for dark theme
		expect(cssContent).toContain('[data-theme="dark"]');
	});

	// Test that vite config has Tailwind plugin
	it('should have Tailwind CSS plugin in vite.config.ts', () => {
		const viteConfigPath = join(process.cwd(), 'vite.config.ts');
		expect(existsSync(viteConfigPath)).toBe(true);
		const viteConfig = readFileSync(viteConfigPath, 'utf-8');

		expect(viteConfig).toContain("@tailwindcss/vite");
		expect(viteConfig).toContain("tailwindcss()");
	});

	// Test package.json has required dependencies
	it('should have Tailwind CSS v4 dependencies in package.json', () => {
		const packageJsonPath = join(process.cwd(), 'package.json');
		expect(existsSync(packageJsonPath)).toBe(true);
		const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

		expect(packageJson.devDependencies).toBeDefined();
		expect(packageJson.devDependencies.tailwindcss).toMatch(/\^4\./);
		expect(packageJson.devDependencies['@tailwindcss/vite']).toMatch(/\^4\./);
	});
});
