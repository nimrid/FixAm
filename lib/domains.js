// Domain registry: every repair category lives here.
// To add a domain: create lib/domains/<id>/{faults.json,prices.json} and add an entry.
import genFaults from "./domains/gen/faults.json";
import genPrices from "./domains/gen/prices.json";
import okadaFaults from "./domains/okada/faults.json";
import okadaPrices from "./domains/okada/prices.json";
import solarFaults from "./domains/solar/faults.json";
import solarPrices from "./domains/solar/prices.json";
import phoneFaults from "./domains/phone/faults.json";
import phonePrices from "./domains/phone/prices.json";
import carFaults from "./domains/car/faults.json";
import carPrices from "./domains/car/prices.json";

const DOMAINS = {
  gen: {
    id: "gen",
    name: "Generator",
    tagline: "Tiger, Elepaq, Firman",
    faults: genFaults,
    prices: genPrices,
    aliases: {
      "plug": "spark-plug", "sparkplug": "spark-plug", "carb": "carburetor",
      "carburettor": "carburetor", "airfilter": "air-filter", "fuel-cock": "fuel-valve",
      "fuel-tap": "fuel-valve", "fuel-switch": "fuel-valve", "pull-starter": "recoil-starter",
      "starter-rope": "recoil-starter", "coil": "ignition-coil", "voltage-regulator": "avr",
      "oil": "engine-oil", "fuel-strainer": "fuel-filter"
    },
    samConcepts: [
      { concept: "generator", label: "generator" },
      { concept: "gas tank", label: "fuel tank" },
      { concept: "control panel", label: "control panel" },
      { concept: "engine", label: "engine" },
      { concept: "carburetor", label: "carburetor" },
      { concept: "air filter", label: "air filter" },
      { concept: "spark plug", label: "spark plug" }
    ],
    conceptLabels: {
      "generator": "generator", "gas tank": "fuel tank", "control panel": "control panel",
      "engine": "engine", "carburetor": "carburetor", "air filter": "air filter",
      "spark plug": "spark plug", "exhaust muffler": "exhaust", "fuel valve": "fuel valve",
      "recoil starter": "recoil starter", "power outlet": "outlets", "oil cap": "oil cap"
    }
  },
  okada: {
    id: "okada",
    name: "Okada",
    tagline: "Bajaj Boxer, Honda CG",
    faults: okadaFaults,
    prices: okadaPrices,
    aliases: {
      "plug": "spark-plug", "sparkplug": "spark-plug", "chain": "drive-chain-kit",
      "sprocket": "drive-chain-kit", "brake-shoe": "brake-shoe-set", "brake-pads": "brake-shoe-set",
      "brake-shoes": "brake-shoe-set", "brake-cables": "brake-cable",
      "oil": "engine-oil-20w50", "tube": "tube-300-17", "tyre-tube": "tube-300-17",
      "bulb": "headlamp-bulb", "headlight-bulb": "headlamp-bulb", "fuse": "fuse-10a",
      "battery": "battery-12v"
    },
    samConcepts: [
      { concept: "motorcycle", label: "bike" },
      { concept: "fuel tank", label: "fuel tank" },
      { concept: "engine", label: "engine" },
      { concept: "front wheel", label: "front wheel" },
      { concept: "headlamp", label: "headlamp" },
      { concept: "exhaust pipe", label: "exhaust" },
      { concept: "drive chain", label: "chain" }
    ],
    conceptLabels: {
      "motorcycle": "bike", "fuel tank": "fuel tank", "engine": "engine",
      "front wheel": "front wheel", "rear wheel": "rear wheel", "headlamp": "headlamp",
      "exhaust pipe": "exhaust", "drive chain": "chain", "seat": "seat",
      "handlebar": "handlebar", "carburetor": "carburetor", "spark plug": "spark plug"
    }
  },
  solar: {
    id: "solar",
    name: "Solar",
    tagline: "Inverter, panels, battery",
    faults: solarFaults,
    prices: solarPrices,
    aliases: {
      "battery": "tubular-battery-220ah", "tubular": "tubular-battery-220ah",
      "panel": "panel-550w", "solar-panel": "panel-550w", "controller": "charge-controller-60a",
      "mppt": "charge-controller-60a", "inverter": "inverter-3kva", "breaker": "dc-breaker-63a",
      "fan": "inverter-fan-12v", "cooling-fan": "inverter-fan-12v", "mc4": "mc4-pair",
      "cable": "battery-cable-25mm"
    },
    samConcepts: [
      { concept: "solar panel", label: "panel" },
      { concept: "inverter", label: "inverter" },
      { concept: "battery", label: "battery" },
      { concept: "charge controller", label: "controller" },
      { concept: "circuit breaker", label: "breaker" },
      { concept: "electrical cable", label: "cables" }
    ],
    conceptLabels: {
      "solar panel": "panel", "inverter": "inverter", "battery": "battery",
      "charge controller": "controller", "circuit breaker": "breaker",
      "electrical cable": "cables", "battery terminal": "terminal", "display screen": "display"
    }
  },
  phone: {
    id: "phone",
    name: "Phone",
    tagline: "Tecno, Infinix, Samsung",
    faults: phoneFaults,
    prices: phonePrices,
    aliases: {
      "battery": "battery-replacement", "screen": "screen-tecno-infinix",
      "display": "screen-tecno-infinix", "digitizer": "screen-tecno-infinix",
      "samsung-screen": "screen-samsung", "port": "charging-port-fix",
      "charging-port": "charging-port-fix", "charger": "charger-18w",
      "cable": "fast-cable", "usb-cable": "fast-cable",
      "glass": "tempered-glass", "screen-guard": "tempered-glass",
      "back": "phone-back-cover", "back-panel": "phone-back-cover"
    },
    samConcepts: [
      { concept: "smartphone", label: "phone" },
      { concept: "phone screen", label: "screen" },
      { concept: "charging port", label: "port" },
      { concept: "phone battery", label: "battery" },
      { concept: "phone camera", label: "camera" },
      { concept: "phone case", label: "case" }
    ],
    conceptLabels: {
      "smartphone": "phone", "phone screen": "screen", "charging port": "port",
      "phone battery": "battery", "phone camera": "camera", "phone case": "case",
      "charger": "charger", "usb cable": "cable"
    }
  },
  car: {
    id: "car",
    name: "Car",
    tagline: "Toyota, Honda, Lexus",
    faults: carFaults,
    prices: carPrices,
    aliases: {
      "battery": "car-battery-75ah", "car-battery": "car-battery-75ah",
      "coolant": "coolant-4l", "antifreeze": "coolant-4l",
      "thermostat": "thermostat-toyota", "brake-pads": "brake-pads-front",
      "pads": "brake-pads-front", "brake-fluid": "brake-fluid-dot4",
      "tyre": "tyre-205-55r16", "tire": "tyre-205-55r16",
      "scan": "obd-scan", "diagnostic-scan": "obd-scan",
      "belt": "drive-belt", "fan-belt": "drive-belt", "alternator-belt": "drive-belt",
      "bearing": "wheel-bearing", "oil-change": "engine-oil-filter",
      "service": "engine-oil-filter"
    },
    samConcepts: [
      { concept: "car", label: "car" },
      { concept: "engine bay", label: "engine" },
      { concept: "car battery", label: "battery" },
      { concept: "tyre", label: "tyre" },
      { concept: "brake disc", label: "brake" },
      { concept: "radiator", label: "radiator" },
      { concept: "dashboard", label: "dashboard" },
      { concept: "headlight", label: "headlight" }
    ],
    conceptLabels: {
      "car": "car", "engine bay": "engine", "car battery": "battery",
      "tyre": "tyre", "brake disc": "brake", "radiator": "radiator",
      "dashboard": "dashboard", "headlight": "headlight", "coolant reservoir": "coolant",
      "oil dipstick": "dipstick", "fan belt": "belt", "shock absorber": "shock"
    }
  }
};

export function getDomain(id) {
  return DOMAINS[id] || DOMAINS.gen;
}

export function domainIds() {
  return Object.keys(DOMAINS);
}

export const DOMAIN_META = Object.values(DOMAINS).map(({ id, name, tagline }) => ({ id, name, tagline }));
