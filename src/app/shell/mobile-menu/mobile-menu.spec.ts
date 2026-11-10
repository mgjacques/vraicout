import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { MobileMenu } from './mobile-menu';

@Component({ template: '' })
class Blank {}

async function openMenu() {
  // Any tool path leads somewhere, so following a link completes.
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: '**', component: Blank }])],
  });
  const fixture = TestBed.createComponent(MobileMenu);
  fixture.componentRef.setInput('visible', true);
  await fixture.whenStable();
  const panel = document.querySelector<HTMLElement>('.mobile-menu');
  if (!panel) throw new Error('Le panneau ne s’est pas ouvert.');
  return { fixture, panel };
}

describe('MobileMenu', () => {
  it('shows support and theme at the top, home, the tools and about, then moving and clearing the data at the bottom', async () => {
    const { panel } = await openMenu();
    const order = [
      ...panel.querySelectorAll(
        '.support-link, .theme-toggle, .mobile-menu-tools a, .mobile-menu-transfer, .mobile-menu-clear',
      ),
    ].map((el) => el.className.split(' ')[0] || el.textContent?.trim());
    expect(order).toEqual([
      'support-link',
      'theme-toggle',
      'Accueil',
      'Partage des dépenses',
      'Prix en heures',
      'Dépenses fréquentes',
      'Taux marginal',
      'Épargne dans le temps',
      'Frais de gestion',
      'Assurance vie',
      'Assurance hypothécaire',
      'Ressources',
      'À propos',
      'mobile-menu-transfer',
      'mobile-menu-clear',
    ]);
  });

  it('groups the tools by theme', async () => {
    const { panel } = await openMenu();
    const groups = [...panel.querySelectorAll('.mobile-menu-tools ul[aria-labelledby]')].map(
      (list) => [
        panel.querySelector(`#${list.getAttribute('aria-labelledby')}`)?.textContent?.trim(),
        ...[...list.querySelectorAll('a')].map((link) => link.textContent?.trim()),
      ],
    );
    expect(groups).toEqual([
      ['Au quotidien', 'Partage des dépenses', 'Prix en heures', 'Dépenses fréquentes'],
      [
        'Épargne et assurances',
        'Taux marginal',
        'Épargne dans le temps',
        'Frais de gestion',
        'Assurance vie',
        'Assurance hypothécaire',
      ],
    ]);
  });

  it('closes when a tool is chosen', async () => {
    const { fixture, panel } = await openMenu();
    panel.querySelector<HTMLAnchorElement>('.mobile-menu-tools a')!.click();
    expect(fixture.componentInstance.visible()).toBe(false);
    // Let the navigation the link started finish before the test tears the router down.
    await fixture.whenStable();
  });

  it('closes and asks for confirmation before clearing the data', async () => {
    const { fixture, panel } = await openMenu();
    panel.querySelector<HTMLButtonElement>('.mobile-menu-clear')!.click();
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(fixture.componentInstance.confirming()).toBe(true);
  });
});
