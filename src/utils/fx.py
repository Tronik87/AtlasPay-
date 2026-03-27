import asyncio
import aiohttp
import json
import os
import logging
from functools import lru_cache

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

CACHE_FILE = os.path.join("data", "fx_cache.json")
fx_cache = {}

def load_cache():
    global fx_cache
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as f:
                data = json.load(f)
                # Convert list keys back to tuples
                fx_cache = {tuple(eval(k)): v for k, v in data.items()}
                logger.info(f"Loaded {len(fx_cache)} rates from cache")
        except Exception as e:
            logger.error(f"Failed to load cache: {e}")
            fx_cache = {}

def save_cache():
    try:
        # Convert tuple keys to strings for JSON
        data = {str(list(k)): v for k, v in fx_cache.items()}
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w") as f:
            json.dump(data, f, indent=2)
        logger.info(f"Saved {len(fx_cache)} rates to cache")
    except Exception as e:
        logger.error(f"Failed to save cache: {e}")

load_cache()


CURRENCY_PAIRS = [
    ("USD", "INR"),
    ("USD", "EUR"),
    ("USD", "GBP"),
    ("EUR", "USD"),
    ("EUR", "INR"),
    ("EUR", "GBP"),
    ("INR", "USD"),
    ("INR", "EUR"),
    ("INR", "GBP"),
    ("GBP", "USD"),
    ("GBP", "EUR"),
    ("GBP", "INR"),
]

DEFAULT_RATES = {
    ("USD", "INR"): 83.0,
    ("USD", "EUR"): 0.92,
    ("USD", "GBP"): 0.79,
    ("EUR", "USD"): 1.09,
    ("EUR", "INR"): 90.0,
    ("EUR", "GBP"): 0.86,
    ("INR", "USD"): 0.012,
    ("INR", "EUR"): 0.011,
    ("INR", "GBP"): 0.0095,
    ("GBP", "USD"): 1.27,
    ("GBP", "EUR"): 1.16,
    ("GBP", "INR"): 105.0,
}


def get_fx_rate(from_currency, to_currency):
    key = (from_currency, to_currency)
    if key in fx_cache:
        return fx_cache[key]
    return DEFAULT_RATES.get(key, 1.0)


async def fetch_rate(session, from_curr, to_curr, semaphore):
    async with semaphore:
        key = (from_curr, to_curr)
        
        # Check cache again in case it was updated by another task
        if key in fx_cache:
            return key, fx_cache[key]
            
        url = f"https://api.exchangerate.host/convert?from={from_curr}&to={to_curr}"
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=2)) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    rate = data.get("result")
                    if rate:
                        return key, rate
                
                logger.warning(f"API failed for {from_curr}->{to_curr}, status: {resp.status}")
                return key, DEFAULT_RATES.get(key, 1.0)
        except Exception as e:
            logger.debug(f"API error for {from_curr}->{to_curr}: {e}")
            return key, DEFAULT_RATES.get(key, 1.0)


async def prefetch_fx_rates_async(currencies):
    global fx_cache
    semaphore = asyncio.Semaphore(20)

    pairs = [(c1, c2) for c1 in currencies for c2 in currencies if c1 != c2]

    async with aiohttp.ClientSession() as session:
        tasks = [fetch_rate(session, c1, c2, semaphore) for c1, c2 in pairs]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        updated = False
        for result in results:
            if isinstance(result, tuple):
                key, rate = result
                if key not in fx_cache or fx_cache[key] != rate:
                    fx_cache[key] = rate
                    updated = True
            elif isinstance(result, Exception):
                logger.error(f"Async prefetch task error: {result}")

        if updated:
            save_cache()

    return fx_cache


def prefetch_fx_rates(currencies):
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    if loop.is_running():
        import concurrent.futures

        with concurrent.futures.ThreadPoolExecutor() as pool:
            future = pool.submit(asyncio.run, prefetch_fx_rates_async(currencies))
            return future.result()
    else:
        return loop.run_until_complete(prefetch_fx_rates_async(currencies))
