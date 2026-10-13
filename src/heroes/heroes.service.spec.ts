import { NotFoundException } from '@nestjs/common';
import { heroesData } from '../data/heroes.data';
import { HeroesService } from './heroes.service';

describe('HeroesService mutations', () => {
  let service: HeroesService;

  beforeEach(() => {
    service = new HeroesService();
  });

  it('persists updates for subsequent reads', () => {
    const hero = heroesData[0];
    service.update(hero.id, { alias: 'Updated alias' });
    expect(service.findOne(hero.id).alias).toBe('Updated alias');
  });

  it('removes a hero addressed by its slug', () => {
    const hero = heroesData[0];
    service.remove(hero.slug);
    expect(() => service.findOne(hero.id)).toThrow(NotFoundException);
  });

  it('keeps IDs unique after a deletion and creation', () => {
    for (const hero of heroesData) service.remove(hero.id);
    const first = service.create({ ...heroesData[0], name: 'First Hero' });
    service.create({ ...heroesData[0], name: 'Second Hero' });
    service.remove(first.id);
    const created = service.create({ ...heroesData[0], name: 'New Hero' });
    const ids = service.findAll({ limit: 1000 }).heroes.map((hero) => hero.id);
    expect(ids.filter((id) => id === created.id)).toHaveLength(1);
  });

  it('returns an empty summary after removing every hero', () => {
    for (const hero of heroesData) service.remove(hero.id);
    expect(service.getHeroSummary()).toEqual({
      totalHeroes: 0,
      strongestHero: null,
      smartestHero: null,
      heroCount: 0,
      villainCount: 0,
    });
  });

  it('accepts zero as a strength search value', () => {
    expect(service.findByAdvancedSearch({ strength: 0 })).toHaveLength(
      heroesData.length,
    );
  });
});
