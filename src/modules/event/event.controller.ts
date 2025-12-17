import { Request, Response } from 'express';
import { EventService } from './event.service.js';

const eventService = new EventService();

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(201).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    const event = await eventService.getEventById(id);
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { name, description, dateHijri, estimatedGregorian } = req.body;

    if (!name || !dateHijri) {
      return res.status(400).json({
        success: false,
        message: 'Name and dateHijri are required',
      });
    }

    const eventData = {
      name,
      description,
      dateHijri,
      estimatedGregorian: estimatedGregorian ? new Date(estimatedGregorian) : undefined,
    };

    const event = await eventService.createEvent(eventData);
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    const { name, description, dateHijri, estimatedGregorian } = req.body;

    const eventData = {
      name,
      description,
      dateHijri,
      estimatedGregorian: estimatedGregorian ? new Date(estimatedGregorian) : undefined,
    };

    const event = await eventService.updateEvent(id, eventData);
    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    await eventService.deleteEvent(id);
    res.status(201).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getUpcomingEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.getUpcomingEvents();
    res.status(201).json({
      success: true,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
