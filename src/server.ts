import express, { json, Request, Response } from 'express';
import cors from 'cors';

import { PrismaClient } from '@prisma/client';

import { convertHourStringToMinutes } from './utils/convertHourStringtoMinutes';
import { convertMinutesToHourString } from './utils/convertMinutesToHourString';

const app = express();

app.use(json());
app.use(cors());

const prisma = new PrismaClient({
  log: ['query']
});

app.get('/games', async (request: Request, response: Response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true
        }
      }
    }
  });
  
  return response.status(200).json(games);
})

app.get('/games/:id/ads', async (request: Request, response: Response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
      gameId: true,
      game: {
        select: {
          title: true,
          bannerUrl: true
        }
      }
    },
    where: {
      gameId
    }, 
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedAds = ads.map((ad) => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd)
    }
  })
  
  return response.status(200).json(formattedAds);
})

app.get('/ads', async (request: Request, response: Response) => {
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      weekDays: true,
      useVoiceChannel: true,
      yearsPlaying: true,
      hourStart: true,
      hourEnd: true,
      game: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedAds = ads.map((ad) => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: convertMinutesToHourString(ad.hourStart),
      hourEnd: convertMinutesToHourString(ad.hourEnd)
    }
  })

  return response.status(200).json(formattedAds);
})

app.post('/games/:id/ads', async (request: Request, response: Response) => {
  const { body } = request;
  const gameId = request.params.id;

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      discord: body.discord,
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      hourStart: convertHourStringToMinutes(body.hourStart),
      useVoiceChannel: body.useVoiceChannel,
      yearsPlaying: body.yearsPlaying,
      weekDays: body.weekDays.join(',')
    },
    include: {
      game: {
        select: {
          title: true,
          bannerUrl: true
        }
      }
    }
  })

  const formattedAd = {
    ...ad,
    weekDays: ad.weekDays.split(','),
    hourStart: convertMinutesToHourString(ad.hourStart),
    hourEnd: convertMinutesToHourString(ad.hourEnd)
  }

  return response.status(201).json(formattedAd);
})

app.get('/ads/:id/discord', async (request: Request, response: Response) => {
  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    where: {
      id: adId
    },
    select: {
      discord: true
    }
  })
  
  return response.status(200).json(ad);
})


app.listen(3333)