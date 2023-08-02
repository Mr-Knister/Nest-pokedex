import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
    private readonly httpAdapter: AxiosAdapter,
  ) {}

  async executeSEED() {
    await this.pokemonModel.deleteMany({});

    // const { data } = await axios.get<PokeResponse>(
    //   'https://pokeapi.co/api/v2/pokemon?limit=1000',
    // );
    const data = await this.httpAdapter.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=1000',
    );
    // // data.results.forEach(async ({ name, url }) => {
    // //   // console.log({ name, url });
    // //   const segments = url.split('/');
    // //   const no: number = +segments[segments.length - 2];

    // //   const pokemon = await this.pokemonModel.create({ name, no });

    // //   // console.log({ name, no });
    // // });

    // // const insertPromisesArray = [];
    // // data.results.forEach(async ({ name, url }) => {
    // //   const segments = url.split('/');
    // //   const no: number = +segments[segments.length - 2];
    // //   insertPromisesArray.push(this.pokemonModel.create({ name, no }));
    // // });
    // // await Promise.all(insertPromisesArray);

    const pokemonToInsert: { name: string; no: number }[] = [];
    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no });
    });
    await this.pokemonModel.insertMany(pokemonToInsert);
    // // return data.results;
    return `SEED executed`;
  }
}
