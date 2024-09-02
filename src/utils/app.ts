import { PersistedPendingGameResult } from '../types/game';
import { PythPrice } from '../types/pyth';
import env from '../env';

const BTC_USD_ID = env['PYTH_PROGRAM_ID'];

const getPythPrice = async (timestamp: number) => {
  const apiUrl = `https://hermes.pyth.network/v2/updates/price/${timestamp}?ids%5B%5D=${BTC_USD_ID}&encoding=base64&parsed=true`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Error fetching data from Pyth Network:', error);
    throw error;
  }
};

export const getPythPrices = async (
  game: PersistedPendingGameResult,
): Promise<[PythPrice, PythPrice] | [null, null]> => {
  const { startTime, endTime } = game;

  if (startTime && endTime) {
    const [priceAtStart, priceAtEnd] = await Promise.all([getPythPrice(startTime), getPythPrice(endTime)]);

    return [
      priceAtStart.parsed[0]?.price as PythPrice,
      priceAtEnd.parsed[0]?.price as PythPrice,
    ];
  }

  return [null, null];
};
