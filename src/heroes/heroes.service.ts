import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { Hero } from './entities/hero.entity';
import { heroesData } from 'src/data/heroes.data';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AdvancedSearchDto } from './dto/advande-search.dto';

@Injectable()
export class HeroesService {
  private heroes: Hero[] = structuredClone(heroesData);
  private nextId = Math.max(0, ...heroesData.map((hero) => Number(hero.id))) + 1;

  create(createHeroDto: CreateHeroDto) {
    const hero = {
      ...createHeroDto,
      id: `${this.nextId++}`,
      slug: createHeroDto.name.toLowerCase().replace(/ /g, '-'),
    };

    this.heroes.push(hero);

    return hero;
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 6, offset = 0, category = 'all' } = paginationDto;

    let heroes = [...this.heroes];
    let heroCount = heroes.length;

    if (category !== 'all') {
      heroes = heroes.filter(
        (hero) => hero.category.toLowerCase() === category.toLowerCase(),
      );
      heroCount = heroes.length;
    }

    heroes = heroes.slice(offset, offset + limit);

    return {
      total: heroCount,
      pages: Math.ceil(heroCount / limit),
      heroes,
    };
  }

  findOne(idOrSlug: string) {
    const hero = this.heroes.find(
      (hero) => hero.id === idOrSlug || hero.slug === idOrSlug,
    );

    if (!hero) {
      throw new NotFoundException('Hero not found');
    }

    return hero;
  }

  update(id: string, updateHeroDto: UpdateHeroDto) {
    const hero = this.findOne(id);

    Object.assign(hero, updateHeroDto);
    return hero;
  }

  remove(id: string) {
    const hero = this.findOne(id);

    this.heroes = this.heroes.filter((candidate) => candidate.id !== hero.id);

    return hero;
  }

  getHeroSummary() {
    const heroes = this.heroes;
    const totalHeroes = heroes.length;
    const strongestHero = heroes.reduce<Hero | null>(
      (max, hero) => !max || hero.strength > max.strength ? hero : max,
      null,
    );
    const smartestHero = heroes.reduce<Hero | null>(
      (max, hero) => !max || hero.intelligence > max.intelligence ? hero : max,
      null,
    );

    const heroCount = heroes.reduce((acc, hero) => {
      if (hero.category === 'Hero') {
        return acc + 1;
      }

      return acc;
    }, 0);

    const villainCount = heroes.reduce((acc, hero) => {
      if (hero.category === 'Villain') {
        return acc + 1;
      }

      return acc;
    }, 0);

    return {
      totalHeroes,
      strongestHero,
      smartestHero,
      heroCount,
      villainCount,
    };
  }

  findByAdvancedSearch(advancedSearchDto: AdvancedSearchDto) {
    const { name, team, category, universe, status, strength } =
      advancedSearchDto;

    if (!name && !team && !category && !universe && !status && strength == null) {
      throw new BadRequestException(
        'At least one search parameter is required',
      );
    }

    let filteredHeroes = [...this.heroes];

    if (name) {
      filteredHeroes = filteredHeroes.filter(
        (hero) =>
          hero.name.toLowerCase().includes(name.toLowerCase()) ||
          hero.alias.toLowerCase().includes(name.toLowerCase()),
      );
    }

    if (team) {
      filteredHeroes = filteredHeroes.filter((hero) =>
        hero.team.toLowerCase().includes(team.toLowerCase()),
      );
    }

    if (category) {
      filteredHeroes = filteredHeroes.filter((hero) =>
        hero.category.toLowerCase().includes(category.toLowerCase()),
      );
    }

    if (universe) {
      filteredHeroes = filteredHeroes.filter((hero) =>
        hero.universe.toLowerCase().includes(universe.toLowerCase()),
      );
    }

    if (status) {
      filteredHeroes = filteredHeroes.filter((hero) =>
        hero.status.toLowerCase().includes(status.toLowerCase()),
      );
    }

    if (strength != null) {
      filteredHeroes = filteredHeroes.filter(
        (hero) => hero.strength >= strength,
      );
    }

    return filteredHeroes.sort((a, b) => a.name.localeCompare(b.name));
  }
}
