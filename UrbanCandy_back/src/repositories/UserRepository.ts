import Users from '../models/Users.js';
import People from '../models/People.js';
import Address from '../models/Address.js';

class UserRepository {
  async findAllUsers(limit: number, offset: number) {
    return await Users.findAndCountAll({
      limit: limit,
      offset: offset,
      order: [['id_user', 'ASC']],
      attributes: { exclude: ['password'] },
    });
  }

  async findByIdUser(id_user: number) {
    return await Users.findByPk(id_user, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: People,
          as: 'people',
          include: [
            {
              model: Address,
              as: 'address',
            },
          ],
        },
      ],
    });
  }

  async findByEmail(email: string) {
    return await Users.findOne({
      where: { email },
      include: [
        {
          model: People,
          as: 'people',
        },
      ],
    });
  }

  async findByCpf(cpf: string) {
    return await People.findOne({ where: { cpf } });
  }

  async createUser(
    userData: Partial<Users>,
    personData: Partial<People>,
    addressData: Partial<Address>
  ): Promise<Users> {
    const newAddress = await Address.create(addressData);

    const newUser = await Users.create(userData);

    await People.create({
      ...personData,
      id_user: newUser.id_user,
      id_address: newAddress.id_address,
    });

    return newUser;
  }

  async updateUser(id_user: number, userData: Partial<Users>, personData: Partial<People>) {
    await Users.update(userData, { where: { id_user } });
    await People.update(personData, { where: { id_user } });
  }

  async deleteUser(id_user: number) {
    await People.destroy({ where: { id_user } });
    return await Users.destroy({ where: { id_user } });
  }
}

export default new UserRepository();
