import { Router, Request, Response } from 'express';
import { analyzeContent, ExtractionResult } from '../services/contentAnalyzer';
import { planTrip } from '../services/tripPlanner';
import Trip from '../models/Trip';

const router = Router();

function sendError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

async function loadExtraction(
  url: string,
  tripId?: string,
  clientExtraction?: Partial<ExtractionResult>
): Promise<ExtractionResult> {
  if (
    clientExtraction?.places &&
    Array.isArray(clientExtraction.places) &&
    clientExtraction.places.length > 0
  ) {
    return {
      places: clientExtraction.places,
      activities: clientExtraction.activities ?? [],
      vibes: clientExtraction.vibes ?? [],
      transcript: clientExtraction.transcript ?? '',
    };
  }

  if (tripId) {
    const trip = await Trip.findById(tripId);
    if (trip?.places?.length) {
      return {
        places: trip.places,
        activities: trip.activities ?? [],
        vibes: trip.vibes ?? [],
        transcript: trip.transcript ?? '',
      };
    }
  }

  return analyzeContent(url);
}

// POST /api/trips/analyze
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return sendError(res, 400, 'url is required');
    }

    const extraction = await analyzeContent(url);

    const trip = await Trip.create({
      url,
      transcript: extraction.transcript,
      places: extraction.places,
      activities: extraction.activities,
      vibes: extraction.vibes,
    }).catch((err) => {
      console.warn('[DB] Trip.create failed (non-fatal):', err.message);
      return null;
    });

    return res.json({
      success: true,
      tripId: trip?._id ?? null,
      data: {
        places: extraction.places,
        activities: extraction.activities,
        vibes: extraction.vibes,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to analyze content';
    console.error('[/analyze]', message);
    return sendError(res, 500, message);
  }
});

// POST /api/trips/plan
router.post('/plan', async (req: Request, res: Response) => {
  try {
    const { url, persona, tripId, extraction: clientExtraction } = req.body;

    if (!url || !persona) {
      return sendError(res, 400, 'url and persona are required');
    }

    const { travelStyle, groupType, pace, days } = persona;

    if (!travelStyle || !groupType || !pace || !days) {
      return sendError(res, 400, 'persona must include travelStyle, groupType, pace, days');
    }

    const numDays = Number(days);
    if (isNaN(numDays) || numDays < 1 || numDays > 14) {
      return sendError(res, 400, 'days must be a number between 1 and 14');
    }

    const extraction = await loadExtraction(url, tripId, clientExtraction);
    const result = await planTrip(extraction, { travelStyle, groupType, pace, days: numDays });

    const tripPayload = {
      url,
      transcript: extraction.transcript,
      places: extraction.places,
      activities: extraction.activities,
      vibes: extraction.vibes,
      persona,
      plans: {
        budget: result.plans.budget,
        comfort: result.plans.comfort,
        luxury: result.plans.luxury,
      },
    };

    let savedTrip = null;
    try {
      if (tripId) {
        savedTrip = await Trip.findByIdAndUpdate(tripId, tripPayload, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        });
      } else {
        savedTrip = await Trip.create(tripPayload);
      }
    } catch (dbErr) {
      console.warn('[DB] Failed to save trip (non-fatal):', (dbErr as Error).message);
    }

    return res.json({
      success: true,
      tripId: savedTrip?._id ?? null,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to plan trip';
    console.error('[/plan]', message);
    return sendError(res, 500, message);
  }
});

// GET /api/trips/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return sendError(res, 404, 'Trip not found');
    }
    return res.json({ success: true, data: trip });
  } catch (err) {
    return sendError(res, 500, (err as Error).message);
  }
});

// GET /api/trips
router.get('/', async (_req: Request, res: Response) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 }).limit(20).select('-transcript');
    return res.json({ success: true, data: trips });
  } catch (err) {
    return sendError(res, 500, (err as Error).message);
  }
});

export default router;
