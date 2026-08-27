import {
  type Request,
  type Response,
  type NextFunction,
} from 'express';

import OfferService from '../service/OfferService.js';
import Offers from '../models/Offers.js';
import { ApiException } from '../exception/ApiException.js';

class OfferController {
  private static parseId = (
    req: Request
  ): number => {
    const { id_offer } = req.params;

    const id = Number(id_offer);

    if (!id_offer || isNaN(id)) {
      throw new ApiException(
        'INVALID_ID',
        400,
        String(id_offer || '')
      );
    }

    return id;
  };

  static findActiveOffers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const offers =
        await OfferService.findActiveOffers();

      res.status(200).json({
        data: offers,
      });
    } catch (error) {
      next(error);
    }
  };

  static findByIdOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id =
        this.parseId(req);

      const offer =
        await OfferService.findByIdOffer(id);

      res.status(200).json(offer);
    } catch (error) {
      next(error);
    }
  };

  static createOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dados = req.body;

      if (req.file) {
        dados.image = req.file.filename;
      }

      const productIds = Array.isArray(
        dados.productIds
      )
        ? dados.productIds.map(Number)
        : [];

      delete dados.productIds;

      if (dados.active !== undefined) {
        dados.active =
          String(dados.active) === 'true' ||
          String(dados.active) === '1';
      }

      const offer =
        Offers.build(dados);

      const newOffer =
        await OfferService.createOffer(
          offer,
          productIds
        );

      res.status(201).json(newOffer);
    } catch (error) {
      next(error);
    }
  };

  static updateOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id =
        this.parseId(req);

      const dados = req.body;

      if (req.file) {
        dados.image = req.file.filename;
      }

      const productIds =
        dados.productIds !== undefined
          ? Array.isArray(dados.productIds)
            ? dados.productIds.map(Number)
            : []
          : undefined;

      delete dados.productIds;

      if (dados.active !== undefined) {
        dados.active =
          String(dados.active) === 'true' ||
          String(dados.active) === '1';
      }

      const offer =
        Offers.build({
          id_offer: id,
          ...dados,
        });

      const updatedOffer =
        await OfferService.updateOffer(
          offer,
          productIds
        );

      res.status(200).json(updatedOffer);
    } catch (error) {
      next(error);
    }
  };

  static deleteOffer = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id =
        this.parseId(req);

      await OfferService.deleteOffer(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default OfferController;