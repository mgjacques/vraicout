import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, Type } from '@angular/core';
import { CONTACT_ADDRESS } from '../contact';
import { MessageKey } from '../i18n/fr';
import { I18nService } from '../i18n/i18n.service';
import { RichText } from '../rich-text/rich-text';

/**
 * One piece of a section, in reading order: a paragraph, a list, the contact address, a source
 * (placed right under the paragraph it backs), a link out to read further, or a formula in
 * MathML (a tool's own component) followed by what each of its symbols stands for.
 */
export type DocPiece =
  | { kind: 'text'; text: MessageKey }
  | { kind: 'list'; items: readonly MessageKey[] }
  | { kind: 'mail' }
  | { kind: 'source'; text: MessageKey; url: string }
  | { kind: 'link'; text: MessageKey; url: string }
  | { kind: 'math'; formula: Type<unknown>; symbols: readonly MathSymbol[] };

/** A symbol of a formula, shown in MathML with its subscript if any, and the words it stands for. */
export interface MathSymbol {
  symbol: string;
  sub?: string;
  text: MessageKey;
}

export interface DocSection {
  id: string;
  title: MessageKey;
  pieces: readonly DocPiece[];
}

export const docText = (key: MessageKey): DocPiece => ({ kind: 'text', text: key });

/** The sections of a reading page (/confidentialite, /<outil>/methode), one heading each. */
@Component({
  selector: 'app-doc-sections',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RichText, NgComponentOutlet],
  templateUrl: './doc-sections.html',
})
export class DocSections {
  readonly i18n = inject(I18nService);
  readonly sections = input.required<readonly DocSection[]>();
  readonly address = CONTACT_ADDRESS;
  readonly mailto = 'mailto:' + CONTACT_ADDRESS;
}
