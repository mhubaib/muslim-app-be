import { Request, Response } from 'express';
import { QuranService } from './quran.service.js';

const quranService = new QuranService();

export const getAllSurahs = async (req: Request, res: Response) => {
  try {
    const surahs = await quranService.getAllSurahs();
    res.status(201).json({
      success: true,
      data: surahs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch surahs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getSurahById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id < 1 || id > 114) {
      return res.status(400).json({
        success: false,
        message: 'Invalid surah ID. Must be between 1 and 114',
      });
    }

    const surah = await quranService.getSurahById(id);
    res.status(201).json({
      success: true,
      data: surah,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch surah',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAyah = async (req: Request, res: Response) => {
  try {
    const surahId = parseInt(req.params.surahId);
    const ayahNumber = parseInt(req.params.ayahNumber);

    if (isNaN(surahId) || isNaN(ayahNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid surah ID or ayah number',
      });
    }

    const ayah = await quranService.getAyah(surahId, ayahNumber);
    res.status(201).json({
      success: true,
      data: ayah,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ayah',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
