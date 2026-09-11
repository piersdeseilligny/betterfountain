import { parse } from '../afterwriting-parser';
import * as fs from 'fs';
import * as path from 'path';

describe('Dialogue with empty lines and line breaks', () => {
    const defaultCfg = {
        print_notes: false,
        print_dialogue_numbers: false,
        use_dual_dialogue: false,
    };

    it('should include empty dialogue line when two spaces are used', () => {
        const script = `DEALER
Ten.
Four.
Dealer gets a seven.
  
Hit or stand sir?

MONKEY
Dude, I’m a monkey.`;

        const parsed = parse(script, defaultCfg, true);
        const tokens = parsed.tokens;

        // Dealer dialogue tokens
        const dealerTokens = tokens.filter(t => t.character === 'DEALER');
        expect(dealerTokens.length).toBe(5);
        expect(dealerTokens[0].text).toBe('Ten.');
        expect(dealerTokens[1].text).toBe('Four.');
        expect(dealerTokens[2].text).toBe('Dealer gets a seven.');
        expect(dealerTokens[3].text).toBe('  ');
        expect(dealerTokens[3].type).toBe('dialogue');
        expect(dealerTokens[4].text).toBe('Hit or stand sir?');
        expect(dealerTokens[4].type).toBe('dialogue');

        // Check HTML output has a br with sourceline for line 4 between the dialogue lines
        expect(parsed.scriptHtml).toContain(
            '<p class="haseditorline" id="sourceline_3">Dealer gets a seven.</p>' +
            '<br class="haseditorline" id="sourceline_4">' +
            '<p class="haseditorline" id="sourceline_5">Hit or stand sir?</p>'
        );
    });

    it('should include empty dialogue line when three or more spaces are used (at least two spaces)', () => {
        const script = `DEALER
Ten.
Four.
Dealer gets a seven.
   
Hit or stand sir?`;

        const parsed = parse(script, defaultCfg, true);
        const tokens = parsed.tokens;

        const dealerTokens = tokens.filter(t => t.character === 'DEALER');
        expect(dealerTokens.length).toBe(5);
        expect(dealerTokens[3].text).toBe('   ');
        expect(dealerTokens[3].type).toBe('dialogue');
        expect(dealerTokens[4].text).toBe('Hit or stand sir?');
        expect(dealerTokens[4].type).toBe('dialogue');

        expect(parsed.scriptHtml).toContain(
            '<p class="haseditorline" id="sourceline_3">Dealer gets a seven.</p>' +
            '<br class="haseditorline" id="sourceline_4">' +
            '<p class="haseditorline" id="sourceline_5">Hit or stand sir?</p>'
        );
    });

    it('should treat line following a single space as action, ending dialogue', () => {
        const script = `DEALER
Ten.
Four.
Dealer gets a seven.
 
Hit or stand sir?

MONKEY
Dude, I’m a monkey.`;

        const parsed = parse(script, defaultCfg, true);
        const hitOrStandToken = parsed.tokens.find(t => t.text === 'Hit or stand sir?');
        expect(hitOrStandToken).toBeDefined();
        expect(hitOrStandToken.type).toBe('action');
    });

    it('should treat line following an empty line as action, ending dialogue', () => {
        const script = `DEALER
Ten.
Four.
Dealer gets a seven.

Hit or stand sir?`;

        const parsed = parse(script, defaultCfg, true);
        const hitOrStandToken = parsed.tokens.find(t => t.text === 'Hit or stand sir?');
        expect(hitOrStandToken).toBeDefined();
        expect(hitOrStandToken.type).toBe('action');
    });

    it('should verify syntax highlighter dialogue end regex', () => {
        const grammarPath = path.resolve(__dirname, '../../syntaxes/fountain.tmLanguage.json');
        const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf-8'));
        const dialogueEndPattern = grammar.repository.dialogue.end;

        const regex = new RegExp(dialogueEndPattern);

        // Blank lines that SHOULD end dialogue (less than two spaces)
        expect(regex.test('')).toBe(true);
        expect(regex.test(' ')).toBe(true);
        expect(regex.test('\t')).toBe(true);
        expect(regex.test('\r')).toBe(true);
        expect(regex.test(' \r')).toBe(true);

        // At least two spaces that should NOT end dialogue
        expect(regex.test('  ')).toBe(false);
        expect(regex.test('   ')).toBe(false);
        expect(regex.test('    ')).toBe(false);
        expect(regex.test('  \r')).toBe(false);
        expect(regex.test('   \r')).toBe(false);

        // Non-empty dialogue text should NOT end dialogue
        expect(regex.test('Hit or stand sir?')).toBe(false);
        expect(regex.test('  Hit or stand sir?')).toBe(false);
    });
});
