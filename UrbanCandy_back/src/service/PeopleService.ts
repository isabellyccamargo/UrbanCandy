import PeopleRepository from '../repositories/PeopleRepository.js';
import People from '../models/People.js';
import { ApiException } from '../exception/ApiException.js';

class PeopleService {
  private validateCPF(cpf: string): void {
    if (!cpf || cpf.length !== 11) {
      throw new ApiException('INVALID_CPF', 400);
    }
  }

  async findAllPeople(
    page: number = 1,
    size: number = 10
  ): Promise<{ rows: People[]; count: number }> {
    const limit = size;
    const offset = (page - 1) * size;
    return await PeopleRepository.findAllPeople(limit, offset);
  }

  async findByIdPeople(idPeople: number): Promise<People> {
    const person = await PeopleRepository.findByIdPeople(idPeople);
    if (!person) throw new ApiException('PEOPLE_NOT_FOUND', 404, idPeople);
    return person;
  }

  async updatePeople(idPeople: number, people: People): Promise<[number]> {
    if (!idPeople) throw new ApiException('REQUIRED_ID', 400);

    const personExists = await this.findByIdPeople(idPeople);

    if (people.cpf && people.cpf !== personExists.cpf) {
      throw new ApiException('CPF_CHANGE_NOT_ALLOWED', 403);
    }

    return await PeopleRepository.updatePeople(idPeople, people);
  }

  async deletePeople(id_people: number): Promise<number> {
    await this.findByIdPeople(id_people);
    return await PeopleRepository.deletePeople(id_people);
  }
}

export default new PeopleService();
