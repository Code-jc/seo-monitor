import { expect, test } from "@playwright/test";
import { matchesTarget } from "../src/search/matches-target";
import type { SearchTarget } from "../src/types/search-visibility";

const target: SearchTarget = {
    id: 'website',
    type: 'website',
    domain: 'hotelcasamalvagto.com',

};

test('matches the domain and subdomain', () => {
    expect(matchesTarget(
        'https://hotelcasamalvagto.com/',
        target
    )).toBe(true);

    expect(matchesTarget(
        'https://www.hotelcasamalvagto.com/habitaciones/',
        target
    )).toBe(true);
});

test('rejects misleading domains and invalid URLs', () => {
    expect(matchesTarget(
        'https://hotelcasamalvagto.com.example.org/',
        target
    )).toBe(false);

    expect(matchesTarget(
        'https://fakehotelcasamavagto.com/',
        target
    )).toBe(false);

    expect(matchesTarget('invalid-url', target)).toBe(false);

});

test('applies the optional URL filter', () => {
    const filteredTarget: SearchTarget = {
        ...target,
        urlContains: '/habitaciones/',
    };

    expect(matchesTarget(
        'https://hotelcasamalvagto.com/habitaciones/',
        filteredTarget
    )).toBe(true);

    expect(matchesTarget(
        'https://hotelcasamalvagto.com/',
        filteredTarget
    )).toBe(false);

});
