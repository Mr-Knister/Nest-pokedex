import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
    // return pokemon;
    // return 'This action adds a new pokemon';
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    let field: string;
    field = '';
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
      field = 'no';
    }
    if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
      field = 'id';
    }
    if (!pokemon && field === '') {
      pokemon = await this.pokemonModel.findOne({
        name: term.toLowerCase().trim(),
      });
      field = 'name';
    }

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with "${field}": "${term}" not found.`,
      );
    return pokemon;
    // return `This action returns a #${id} pokemon`;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, {
        new: true,
      });
      // const pokemon = await this.pokemonModel.create(createPokemonDto);
      // return pokemon;
    } catch (error) {
      this.handleExceptions(error);
    }
    return { ...pokemon.toJSON(), ...updatePokemonDto };
    // return `This action updates a #${id} pokemon`;
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(term);
    // await pokemon.deleteOne();
    // return term;
    // return `This action removes a #${term} pokemon`;
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new BadRequestException(`Pokemon with id: ${id} not found`);
    return;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Can't update Pokemon - Chek server logs`,
    );
  }
}
