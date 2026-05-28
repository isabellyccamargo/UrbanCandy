import { jest, describe, it, expect } from '@jest/globals';
import PeopleService from '../src/service/PeopleService.js';
import PeopleRepository from '../src/repositories/PeopleRepository.js';

describe('People', () => {
  it('deve lançar erro se o usuário tentar mudar o CPF', async () => {
    const dadosNovos: any = { cpf: '99988877766', name: 'Tentando Mudar CPF' };

    jest.spyOn(PeopleRepository, 'findByIdPeople').mockResolvedValue({
      id_people: 1,
      cpf: '11122233344',
    } as any);

    await expect(PeopleService.updatePeople(1, dadosNovos)).rejects.toThrow(
      'CPF_CHANGE_NOT_ALLOWED'
    );
  });

  it('deve atualizar com sucesso se o CPF for o mesmo ou não for enviado', async () => {
    const dadosEdicao: any = { cpf: '11122233344', name: 'Nome Editado' };

    jest.spyOn(PeopleRepository, 'findByIdPeople').mockResolvedValue({
      id_people: 1,
      cpf: '11122233344',
    } as any);

    const spyUpdate = jest.spyOn(PeopleRepository, 'updatePeople').mockResolvedValue([1] as any);

    await PeopleService.updatePeople(1, dadosEdicao);
    expect(spyUpdate).toHaveBeenCalled();
  });
});
