import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import UserService from '../src/service/UserService.js';
import UserRepository from '../src/repositories/UserRepository.js';

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Criação de Usuário (Registro)', () => {
    test('deve lançar erro para e-mail com formato inválido', async () => {
      const dados: any = { email: 'email-errado', cpf: '12345678901', password: 'Senha123' };
      await expect(UserService.createUser(dados)).rejects.toThrow(
        'O e-mail deve conter @ e terminar com .com.'
      );
    });

    test('deve lançar erro se a senha não tiver letras e números ou for curta', async () => {
      const dados: any = { email: 'teste@gmail.com', cpf: '12345678901', password: '123' };
      await expect(UserService.createUser(dados)).rejects.toThrow(
        'A senha deve ter no mínimo 8 caracteres'
      );
    });

    test('deve impedir cadastro com e-mail duplicado', async () => {
      const dados: any = { email: 'duplicado@gmail.com', cpf: '12345678901', password: 'Senha123' };

      jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue({ id_user: 1 } as any);

      await expect(UserService.createUser(dados)).rejects.toThrow(
        'Já existe um registro com o e-mail'
      );
    });

    test('deve impedir cadastro com CPF duplicado', async () => {
      const dados: any = { email: 'novo@icloud.com', cpf: '12345678901', password: 'Senha123' };

      jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(UserRepository, 'findByCpf').mockResolvedValue({ id_people: 1 } as any);

      await expect(UserService.createUser(dados)).rejects.toThrow(
        'Já existe um registro com o CPF'
      );
    });
  });

  describe('Autenticação (Login)', () => {
    test('deve realizar login com sucesso', async () => {
      const senhaPlana = 'Senha123';
      const senhaHash = await bcrypt.hash(senhaPlana, 10);

      jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue({
        id_user: 1,
        email: 'user@gmail.com',
        password: senhaHash,
        people: { name: 'Fulano' },
      } as any);

      const result = await UserService.login('user@gmail.com', senhaPlana);
      expect(result.user.nome).toBe('Fulano');
    });

    test('deve falhar login com senha incorreta', async () => {
      jest.spyOn(UserRepository, 'findByEmail').mockResolvedValue({
        password: 'hash_de_outra_senha',
      } as any);

      await expect(UserService.login('user@gmail.com', 'senha_errada')).rejects.toThrow(
        'E-mail ou senha incorretos.'
      );
    });
  });

  describe('Atualização (Update)', () => {
    test('deve impedir a alteração de e-mail', async () => {
      const dadosUpdate = { email: 'novo@gmail.com' };
      await expect(UserService.updateUser(1, dadosUpdate, {})).rejects.toThrow(
        'EMAIL_CHANGE_NOT_ALLOWED'
      );
    });

    test('deve encriptar a nova senha ao atualizar', async () => {
      const dadosUpdate = { password: 'NovaSenha123' };
      const spyUpdate = jest.spyOn(UserRepository, 'updateUser').mockResolvedValue({} as any);

      await UserService.updateUser(1, dadosUpdate, {});

      const chamadaRepo = spyUpdate.mock.calls[0]![1];
      expect(chamadaRepo.password).not.toBe('NovaSenha123');
      expect(chamadaRepo.password).toHaveLength(60);
    });
  });
});
