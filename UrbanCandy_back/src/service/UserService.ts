import UserRepository from '../repositories/UserRepository.js';
import Users from '../models/Users.js';
import People from '../models/People.js';
import bcrypt from 'bcrypt';
import Address from '../models/Address.js';
import { ApiException } from '../exception/ApiException.js';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

interface UserWithProfile extends Users {
  people?: {
    name: string;
  };
}

interface IUserRegistration {
  email: string;
  password?: string;
  name: string;
  cpf: string;
  telephone: string;
  cep: string;
  city: string;
  neighborhood: string;
  road: string;
  number: number;
  complement: string;
  administrator?: string;
}

class UserService {
  private validateEmail(email: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/;

    if (!regex.test(email)) {
      throw new ApiException('INVALID_EMAIL', 400);
    }
  }

  private validateCPF(cpf: string) {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) {
      throw new ApiException('INVALID_CPF', 400);
    }
  }

  private validatePasswordLevel(password: string) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!regex.test(password)) {
      throw new ApiException('INVALID_PASSWORD', 400);
    }
  }

  async login(email: string, password: string) {
    const user = (await UserRepository.findByEmail(email)) as UserWithProfile;

    if (!user) throw new ApiException('USER_NOT_FOUND', 404);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new ApiException('INVALID_CREDENTIALS', 401);

    const token = jwt.sign(
      {
        id: user.id_user,
        email: user.email,
      },
      process.env.JWT_SECRET! as string,
      { expiresIn: '2h' }
    );

    return {
      message: 'Usuário autenticado',
      //Envia a string longa e criptografada que o Front-end deve guardar, no LocalStorage
      token,
      user: {
        id_user: user.id_user,
        nome: user.people?.name || 'Usuário',
      },
    };
  }

  async findAllUsers(page: number = 1, size: number = 10) {
    const limit = size;
    const offset = (page - 1) * size;
    return await UserRepository.findAllUsers(limit, offset);
  }

  async createUser(allData: IUserRegistration): Promise<Users> {
    this.validateEmail(allData.email);
    this.validateCPF(allData.cpf);
    if (!allData.password) throw new ApiException('PASSWORD_REQUIRED', 400);
    this.validatePasswordLevel(allData.password);

    const userExists = await UserRepository.findByEmail(allData.email);
    if (userExists) {
      throw new ApiException('EMAIL_ALREADY_EXISTS', 409, allData.email);
    }

    const cpfExists = await UserRepository.findByCpf(allData.cpf.replace(/\D/g, ''));
    if (cpfExists) {
      throw new ApiException('CPF_ALREADY_EXISTS', 409, allData.cpf);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(allData.password, salt);

    const userData: Partial<Users> = {
      email: allData.email,
      password: hashedPassword,
      administrator: allData.administrator || '0',
    };

    const addressData: Partial<Address> = {
      cep: allData.cep,
      city: allData.city,
      neighborhood: allData.neighborhood,
      road: allData.road,
      complement: allData.complement || '',
      number: BigInt(allData.number),
    };

    const personData: Partial<People> = {
      name: allData.name,
      cpf: allData.cpf,
      telephone: allData.telephone,
    };

    return await UserRepository.createUser(userData, personData, addressData);
  }

  async updateUser(id_user: number, userData: Partial<Users>, personData: Partial<People>) {
    if (userData.email) throw new ApiException('EMAIL_CHANGE_NOT_ALLOWED', 403);

    if (userData.password) {
      this.validatePasswordLevel(userData.password);
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    return await UserRepository.updateUser(id_user, userData, personData);
  }

  async findByIdUser(id_user: number) {
    const user = await UserRepository.findByIdUser(id_user);
    if (!user) throw new ApiException('USER_NOT_FOUND', 404);
    return user;
  }
}

export default new UserService();
