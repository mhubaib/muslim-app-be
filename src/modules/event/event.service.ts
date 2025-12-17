import prisma from '../../config/database.js';

interface CreateEventDto {
  name: string;
  description?: string;
  dateHijri: string;
  estimatedGregorian?: Date;
}

export class EventService {
  async getAllEvents() {
    try {
      const events = await prisma.islamicEvent.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  async getEventById(id: number) {
    try {
      const event = await prisma.islamicEvent.findUnique({
        where: { id },
      });

      if (!event) {
        throw new Error('Event not found');
      }

      return event;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  async createEvent(data: CreateEventDto) {
    try {
      const event = await prisma.islamicEvent.create({
        data: {
          name: data.name,
          description: data.description,
          dateHijri: data.dateHijri,
          estimatedGregorian: data.estimatedGregorian,
        },
      });

      console.log('Event created:', event.name);
      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: number, data: Partial<CreateEventDto>) {
    try {
      const event = await prisma.islamicEvent.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          dateHijri: data.dateHijri,
          estimatedGregorian: data.estimatedGregorian,
        },
      });

      console.log('Event updated:', event.name);
      return event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: number) {
    try {
      await prisma.islamicEvent.delete({
        where: { id },
      });

      console.log('Event deleted:', id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async getUpcomingEvents() {
    try {
      const now = new Date();
      const events = await prisma.islamicEvent.findMany({
        where: {
          estimatedGregorian: {
            gte: now,
          },
        },
        orderBy: { estimatedGregorian: 'asc' },
      });
      return events;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }
}
