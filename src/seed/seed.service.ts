import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    private readonly http: AxiosAdapter
  ) {}  
  
  async executeSeed() {

    // Clean de Pokemon collection
    await this.pokemonModel.deleteMany();

    // Consume the pokeapi url resource
    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // Create and populate a massive insert array
    const pokemonToInsert: {name: string, no: number}[] = [];

    data.results.forEach( ({name, url}) => {
      const segments = url.split('/');
      const no = +segments[ segments.length - 2 ];
    
      pokemonToInsert.push({name, no});
    });

    // Insert the pokemon in a massive mode (just one petition)
    await this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed Executed'
  }

}
