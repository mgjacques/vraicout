import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { RichText, segments } from './rich-text';

describe('segments', () => {
  it('keeps a text without markers whole', () => {
    expect(segments('Rien en gras.')).toEqual([{ text: 'Rien en gras.', style: null }]);
  });

  it('marks the passages between double stars', () => {
    expect(segments('Avant **gras** après, **encore**.')).toEqual([
      { text: 'Avant ', style: null },
      { text: 'gras', style: 'bold' },
      { text: ' après, ', style: null },
      { text: 'encore', style: 'bold' },
      { text: '.', style: null },
    ]);
  });

  it('marks the passages between single stars as italics, next to bold ones', () => {
    expect(segments('En anglais : *cash value* **attention**')).toEqual([
      { text: 'En anglais : ', style: null },
      { text: 'cash value', style: 'italic' },
      { text: ' ', style: null },
      { text: 'attention', style: 'bold' },
    ]);
  });
});

describe('RichText', () => {
  it('renders bold and italics with no space added before the punctuation', () => {
    const fixture = TestBed.createComponent(RichText);
    fixture.componentRef.setInput(
      'text',
      'Il **appartient au contrat**. Voir l’*Aperçu du fonds*. Fin',
    );
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent).toBe('Il appartient au contrat. Voir l’Aperçu du fonds. Fin');
    expect(host.querySelector('strong')?.textContent).toBe('appartient au contrat');
    expect(host.querySelector('em')?.textContent).toBe('Aperçu du fonds');
  });
});
