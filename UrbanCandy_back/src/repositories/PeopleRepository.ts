import People from '../models/People.js';
import Users from '../models/Users.js';

class PeopleRepository {
  async findAllPeople(limit: number, offset: number) {
    return await People.findAndCountAll({
      limit: limit,
      offset: offset,
      include: [{ model: Users, as: 'user', attributes: ['email', 'administrator'] }],
      order: [['id_people', 'ASC']],
    });
  }

  async findByIdPeople(id_people: number) {
    return await People.findByPk(id_people, {
      include: [{ model: Users, as: 'user', attributes: ['email'] }],
    });
  }

  async findByCpf(cpf: string) {
    return await People.findOne({
      where: { cpf: cpf },
    });
  }

  async createPeople(people: People) {
    return await people.save();
  }

  async updatePeople(idPeople: number, peopleData: Partial<People>) {
    return await People.update(peopleData, { where: { id_people: idPeople } });
  }

  async deletePeople(id_people: number) {
    return await People.destroy({
      where: { id_people: id_people },
    });
  }
}

export default new PeopleRepository();
