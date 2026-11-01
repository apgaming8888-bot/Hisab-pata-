# MandiBahi - Mandi Vyapar & Man (Maund) Hisab-Kitab App

An intuitive, fast, and comprehensive digital bahi-khata and trade ledger tailored specifically for agricultural and mandi businesses (अनाज, कपास, दलहन, तिलहन व सब्जी मंडी). It automates complex weight-to-maund (मण / Maund) conversions, lot entries, commission/hamali calculations, daily-monthly trade summaries, and printable farmer sale slips (बिक्री पर्ची).

## User Review & Critical Decisions

> [!IMPORTANT]
> The clarification questions were skipped. We have made sensible, standard defaults matching traditional Indian Mandi trade practices:
> - **Maund (Man) Weight Standard**: Defaults to **20 kg/Man** (standard for Gujarat, MP, West India cotton/oilseed/grain trade) with an instant header toggle to **40 kg/Man** (standard for North India/Punjab/Haryana/UP/Rajasthan) or custom kg per man in Settings.
> - **Bilingual Support**: UI provided in natural Hindi + English (Hinglish/हिंदी), ensuring instant familiarity for mandi vyaparis, aadathis, and farmers.
> - **Offline-First Persistence**: Instant local storage reactivity so entries are preserved across reloads with zero latency, with 1-click CSV/JSON export and PDF/print sale slips.

---

## 1. Overview & Core Concept

- **What It Does**: MandiBahi acts as a digital daily register (आवक-जावक रजिस्टर) and calculation ledger. Vyaparis and commission agents can record arrivals, enter gross/tare weights in kilograms or bags, compute exact Man (मण) and fractions, set rates per Man or Quintal, deduct mandi charges (aadath, hamali, tulaye), track farmer/buyer balances, and generate instant WhatsApp/printable bill slips.
- **Target Audience / Persona**: Mandi commission agents (आढ़ती / दलाल), agricultural traders (व्यापari / गल्ला व्यापारी), ginning & cotton mills, and farmers needing exact weight-to-money calculation in Man.
- **Key Value**: Eliminates manual calculator errors in converting kilograms into Man and applying per-Man rates with various mandi deductions; provides instant daily and monthly trade totals.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Daily Trade Entry (नया व्यापार / आवक दर्ज करें)**:
   - Select entry type: *Aavak (खरीद / आवक)* or *Javak (बिक्री / जावक)*.
   - Enter Party/Farmer Name and Commodity (e.g. Gehun, Kapas, Soyabean, Chana, Sarson, Makka, etc.).
   - Input Bags count (बोरी), Gross Weight (कुल वजन kg), and Kata/Tare Deduction (बारदाना / कांटा कटौती).
   - The app dynamically calculates **Net Kg** and **Total Man (मण)** (e.g. 540 kg = 27.00 Man @ 20kg/man).
   - Enter Rate per Man (भाव प्रति मण ₹) or Rate per Quintal (₹/क्विंटल) — the other rate updates synchronously.
   - Optional Mandi Deductions: Aadath/Commission %, Hamali (हमाली प्रति बोरी), Weighing (तुलाई), and Advance payment (रोकड़ पेशगी).
   - Instant calculation of Net Payable Amount (शुद्ध देय राशि).
   - Save entry -> Immediately updates today's ledger, party bahi, and generates a printable *Bikri Parchi*.

2. **Quick Man (मण) & Bhav Calculator (तुरंत मण कैलकुलेटर)**:
   - Dedicated rapid calculator modal or sidebar widget for on-the-spot mandi deal negotiations: input weight -> see Man, input rate -> see total rupee value, rate per kg, and rate per quintal.

3. **Daily & Monthly Trade Ledger (दैनिक व मासिक बही-खाता)**:
   - Filter by date range, month, party, or commodity.
   - Overview metrics: Today's Total Turnover (कुल व्यापार ₹), Total Weight (कुल वजन kg & मण), Total Bags (कुल बोरी), and Brokerage/Profit earned.
   - High-density tabular listing with quick actions (View Bill Slip, Edit, Delete, Share WhatsApp).

4. **Party Ledger (खाता बही / पार्टी हिसाब)**:
   - List of all Farmers and Buyers with total traded volume, paid amount, and pending balance (बाकी / बकाया).
   - Record payment settlements (नकद, UPI, बैंक ट्रांसफर).

5. **Printable / Sharable Sale Slip (बिक्री पर्ची)**:
   - Professional Mandi Parchi with serial number, trader firm header, date, farmer name, commodity, bag breakdown, gross/net weight, maund conversion, rate, deductions, and authorized stamp area.

### Visual Identity & Theme

- **Aesthetic Direction**: Functional, clean, trustworthy financial dashboard tailored for high-density agricultural trade.
- **Color Palette**:
  - Dominant Neutral: `#F8FAFC` (Slate 50) canvas with crisp `#FFFFFF` cards and `#0F172A` high-contrast typography.
  - Accent / Primary: Deep Mandi Emerald & Forest Green (`#047857` / `#059669`) symbolizing agriculture, prosperity, and financial accuracy.
  - Secondary Accent: Warm Ochre / Amber (`#D97706`) for pending balances and alerts.
  - Borders: Crisp 1px hairline dividers (`#E2E8F0`).
- **Typography**: `Plus Jakarta Sans` for clean titles, paired with `tabular-nums` / monospace figures for all weights, maunds, rates, and rupee currency symbols.
- **Zero-Pill & Anti-Slop**: Clean unboxed metadata with dot separators (`·`), no fake telemetry tickers, and clear human verbs ("पर्ची बनाएं", "व्यापार दर्ज करें", "प्रिंट करें").

---

## 3. Key Product Decisions & Trade-Offs

- **Configurable 1 Man Standard (20 kg vs 40 kg)**:
  - *Chosen Approach*: Prominent top-bar / settings switch between 20 kg/Man (Gujarat/MP/Maharashtra cotton & oilseed) and 40 kg/Man (North India standard) + Custom option.
  - *Why*: Prevents regional confusion; allows traders dealing across states to toggle with 1 click.
- **Client-Side Reactive Storage**:
  - *Chosen Approach*: Browser localStorage with realistic pre-seeded initial trade records.
  - *Why*: Instant speed, zero network latency on busy mandi yard floors, offline reliability, with JSON backup/restore.
- **Dual Unit Rate Sync**:
  - *Chosen Approach*: When entering Rate per Man, Rate per Quintal and Rate per Kg are calculated in real-time, and vice-versa.
  - *Why*: Mandi brokers frequently negotiate in Rs/Man while market boards publish in Rs/Quintal.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MandiBahi Header                                │
│   [MandiBahi Wordmark]  ·  [Man Standard: 20kg/40kg]  ·  [+ New Entry] │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┼──────────────────────────────┐
    ▼                               ▼                              ▼
┌──────────────────┐    ┌──────────────────────┐    ┌────────────────────┐
│ Trade Dashboard  │    │  Daily/Monthly Bahi  │    │   Party Ledger     │
│ - Today's Vyapar │    │  - High-density grid │    │   - Farmer/Buyer   │
│ - Total Man & Kg │    │  - Filters (Fasal,   │    │   - Debit / Credit │
│ - Total Bags     │    │    Date, Party)      │    │   - Balance status │
│ - Quick Calc     │    │  - Export CSV / PDF  │    │   - Settlement log │
└──────────────────┘    └──────────────────────┘    └────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Trade Entry & Slip Modal                          │
│  Commodity · Farmer Name · Bags · Gross/Tare Kg · Net Man · Rate/Man   │
│         Deductions (Aadath %, Hamali, Tulaye) · Net Payable            │
│               [Print / Download Slip] [Save to Bahi]                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model

- `TradeEntry`:
  - `id`: unique string
  - `date`: string (ISO)
  - `type`: `'aavak'` (buy/inward) | `'javak'` (sell/outward)
  - `partyName`: string
  - `partyMobile`: string
  - `commodity`: string (e.g. Gehun, Kapas, Soyabean, Chana, Sarson)
  - `bags`: number (bori)
  - `grossWeightKg`: number
  - `tareWeightKg`: number (kata/bardana katoti)
  - `netWeightKg`: number
  - `kgPerMan`: number (20 or 40)
  - `totalMan`: number (netWeightKg / kgPerMan)
  - `ratePerMan`: number (Rs)
  - `ratePerQuintal`: number (calculated)
  - `grossAmount`: number (totalMan * ratePerMan)
  - `commissionPercent`: number (aadath %)
  - `commissionAmount`: number
  - `hamaliPerBag`: number
  - `hamaliTotal`: number
  - `tulaye`: number
  - `advancePaid`: number
  - `netPayable`: number
  - `paymentStatus`: `'paid'` | `'pending'` | `'partial'`
  - `remarks`: string

- `MandiSettings`:
  - `firmName`: string (e.g. "श्री गणेश ट्रेडिंग कंपनी / मंडी आढ़त")
  - `proprietor`: string
  - `mandiName`: string (e.g. "कृषि उपज मंडी समिति")
  - `mobile`: string
  - `defaultKgPerMan`: 20 | 40 | number
  - `defaultCommissionPercent`: number
  - `defaultHamaliPerBag`: number
