# Airbnb Listing Data Structure — Research & Mapping Document

> Generated: 2026-03-04
> Purpose: Define all data fields available on a public Airbnb listing page and map them to the Zélla AirB `AirbnbPropertyContext` type.

---

## 1. All Data Fields Available on a Public Airbnb Listing Page

Based on research across ScrapeHero, MongoDB sample dataset, BrightData, Oxylabs, and Apify documentation, the following fields are available from an Airbnb listing page (PDP — Property Detail Page).

### 1.1 Identification & Basic Info

| Field | Source | Type | Description |
|---|---|---|---|
| `property_id` | API/Scraper | int/string | Unique Airbnb listing ID (e.g., `18584298`) |
| `listing_url` | API/Scraper | string | Full URL: `https://www.airbnb.com/rooms/{property_id}` |
| `name` | API/Scraper | string | Listing title (e.g., "Oceanfront Black Otter Cove w/hot tub") |
| `description` | API/Scraper | string | Full listing description text |
| `property_type` | API/Scraper | string | `entire_home`, `private_room`, `shared_room`, `hotel_room` |
| `room_type` | MongoDB | string | `Entire home/apt`, `Private room`, `Shared room` |
| `bed_type` | MongoDB | string | `Real Bed`, `Pull-out Sofa`, `Futon`, `Airbed`, `Couch` |

### 1.2 Capacity & Layout

| Field | Source | Type | Description |
|---|---|---|---|
| `accommodates` / `guests` | API/Scraper | int | Max number of guests |
| `bedrooms` | API/Scraper | int | Number of bedrooms |
| `beds` | API/Scraper | int | Number of beds |
| `bathrooms` | API/Scraper | decimal | Number of bathrooms (can be 1.5 etc.) |
| `adults` | API/Scraper | int | Adults in search context |
| `children` | API/Scraper | int | Children in search context |
| `infants` | API/Scraper | int | Infants in search context |

### 1.3 Location

| Field | Source | Type | Description |
|---|---|---|---|
| `address` / `street` | API/Scraper | string | Street address (often obfuscated/redacted for privacy) |
| `neighborhood` / `suburb` | MongoDB | string | Neighborhood name |
| `government_area` | MongoDB | string | Administrative area |
| `city` / `market` | API/Scraper | string | City name |
| `state` | — | string | State/province (parsed from address) |
| `country` | MongoDB | string | Country name |
| `country_code` | MongoDB | string | ISO country code (e.g., "PT") |
| `latitude` | API/Scraper | float | Latitude (often slightly randomized for privacy) |
| `longitude` | API/Scraper | float | Longitude (often slightly randomized for privacy) |
| `is_location_exact` | MongoDB | boolean | Whether coordinates are exact |

### 1.4 Pricing

| Field | Source | Type | Description |
|---|---|---|---|
| `price` | API/Scraper | string | Nightly price (e.g., "$120") |
| `regular_price` | API/Scraper | string | Original price before discount |
| `currency` | API/Scraper | string | Currency symbol/code |
| `price_type` | API/Scraper | string | "night" or other |
| `security_deposit` | MongoDB | decimal | Security deposit amount |
| `cleaning_fee` | MongoDB | decimal | Cleaning fee |
| `extra_people` | MongoDB | decimal | Extra guest fee per night |
| `guests_included` | MongoDB | int | Number of guests included in base price |
| `weekly_price` | MongoDB | decimal | Discounted weekly price |
| `monthly_price` | MongoDB | decimal | Discounted monthly price |

### 1.5 Amenities (Rich Structured Data)

| Field | Source | Type | Description |
|---|---|---|---|
| `amenities` | MongoDB | string[] | Flat list: `["TV", "Wifi", "Kitchen", ...]` |
| `highlighted_amenities` | API/Scraper | string[] | Top amenities shown prominently |
| `detailed_amenities` | API/Scraper | JSON | Categorized amenities (see below) |

**`detailed_amenities` categories (from ScrapeHero sample):**

```json
{
  "Bathroom": ["Bath", "Hair dryer", "Shampoo", "Conditioner", "Body soap", "Hot water", "Shower gel"],
  "Bedroom and laundry": ["Paid washer", "Essentials", "Hangers", "Bed linen", "Extra pillows and blankets", "Iron"],
  "Entertainment": ["TV with standard cable/satellite", "Books and reading material"],
  "Family": ["Travel cot", "Children's books and toys", "High chair", "Board games", "Baby safety gates"],
  "Heating and cooling": ["Indoor fireplace", "Ceiling fan", "Heating"],
  "Home safety": ["Smoke alarm", "Fire extinguisher", "First aid kit"],
  "Internet and office": ["Wifi"],
  "Kitchen and dining": ["Kitchen", "Fridge", "Microwave", "Cooking basics", "Dishes and cutlery", "Dishwasher", "Oven", "Coffee maker"],
  "Location features": ["Waterfront", "Beach access", "Private entrance"],
  "Not included": ["Air conditioning", "Carbon monoxide alarm"],
  "Outdoor": ["Patio or balcony", "Garden", "Outdoor furniture", "BBQ grill"],
  "Parking and facilities": ["Free parking on premises", "Private hot tub"],
  "Scenic views": ["Ocean view"],
  "Services": ["Luggage drop-off allowed", "Long-term stays allowed", "Self check-in", "Lockbox", "Cleaning available during stay"]
}
```

### 1.6 House Rules & Policies

| Field | Source | Type | Description |
|---|---|---|---|
| `house_rules` | API/Scraper | string[] | e.g., `["Check-in after 3:00 pm", "Checkout before 11:00 am", "6 guests maximum"]` |
| `health_and_safety` | API/Scraper | string[] | e.g., `["Carbon monoxide alarm not reported", "Smoke alarm", "Pet(s) live on property"]` |
| `minimum_nights` | MongoDB | int | Minimum stay length |
| `maximum_nights` | MongoDB | int | Maximum stay length |
| `cancellation_policy` | MongoDB | string | `flexible`, `moderate`, `strict`, `super_strict_30`, etc. |
| `checkin_time` | parsed from house_rules | string | Check-in time |
| `checkout_time` | parsed from house_rules | string | Checkout time |

### 1.7 Reviews & Ratings

| Field | Source | Type | Description |
|---|---|---|---|
| `reviews_count` / `number_of_reviews` | API/Scraper | int | Total number of reviews |
| `average_rating` / `review_scores` | API/Scraper | float/object | Overall rating (e.g., 4.91) |
| `review_scores_rating` | MongoDB | float | Overall score |
| `review_scores_accuracy` | MongoDB | float | Accuracy of listing description |
| `review_scores_cleanliness` | MongoDB | float | Cleanliness score |
| `review_scores_checkin` | MongoDB | float | Check-in experience |
| `review_scores_communication` | MongoDB | float | Host communication |
| `review_scores_location` | MongoDB | float | Location score |
| `review_scores_value` | MongoDB | float | Value for money |
| `first_review` | MongoDB | date | Date of first review |
| `last_review` | MongoDB | date | Date of most recent review |
| `reviews` (detailed) | API endpoint | array | Individual review objects with text, author, date, rating |

### 1.8 Host Information

| Field | Source | Type | Description |
|---|---|---|---|
| `host_id` | MongoDB | string | Unique host identifier |
| `host_url` | MongoDB | string | Host profile URL |
| `host_name` | MongoDB | string | Host display name |
| `host_location` | MongoDB | string | Host location |
| `host_about` | MongoDB | string | Host bio |
| `host_response_time` | MongoDB | string | e.g., "within an hour" |
| `host_response_rate` | MongoDB | int | Percentage (e.g., 100) |
| `host_is_superhost` | MongoDB | boolean | Superhost status |
| `host_has_profile_pic` | MongoDB | boolean | — |
| `host_identity_verified` | MongoDB | boolean | — |
| `host_listings_count` | MongoDB | int | Number of host's listings |
| `host_total_listings_count` | MongoDB | int | Total listings (including inactive) |
| `host_verifications` | MongoDB | string[] | e.g., `["email", "phone", "jumio", "government_id"]` |
| `host_thumbnail_url` | MongoDB | string | Profile photo URL |
| `host_picture_url` | MongoDB | string | Profile photo URL (larger) |

### 1.9 Property Highlights

| Field | Source | Type | Description |
|---|---|---|---|
| `property_highlights` | API/Scraper | JSON[] | e.g., `[{ "highlight": "Top 5% of homes", "description": "..." }, { "highlight": "Self check-in", "description": "Check yourself in with the lockbox." }, { "highlight": "Superhost", "description": "Janet is a Superhost" }]` |

### 1.10 Images

| Field | Source | Type | Description |
|---|---|---|---|
| `images` | API/Scraper | string[] | Array of photo URLs |
| `thumbnail_url` | MongoDB | string | Thumbnail image |
| `medium_url` | MongoDB | string | Medium image |
| `picture_url` | MongoDB | string | Standard image |
| `xl_picture_url` | MongoDB | string | Extra large image |

### 1.11 Availability & Calendar

| Field | Source | Type | Description |
|---|---|---|---|
| `availability_30` | MongoDB | int | Days available in next 30 |
| `availability_60` | MongoDB | int | Days available in next 60 |
| `availability_90` | MongoDB | int | Days available in next 90 |
| `availability_365` | MongoDB | int | Days available in next 365 |
| `calendar_last_scraped` | MongoDB | date | When calendar was last updated |
| `has_availability` | MongoDB | boolean | Whether listing has any availability |

### 1.12 Additional Metadata (MongoDB)

| Field | Source | Type | Description |
|---|---|---|---|
| `summary` | MongoDB | string | Short description |
| `space` | MongoDB | string | Description of the space |
| `access` | MongoDB | string | What guests can access |
| `interaction` | MongoDB | string | Host interaction description |
| `notes` | MongoDB | string | Additional notes |
| `transit` | MongoDB | string | Transit information |
| `neighborhood_overview` | MongoDB | string | Neighborhood description |
| `last_scraped` | MongoDB | date | Last scrape date |
| `listing_url` | MongoDB | string | Same as property_url |

---

## 2. Which Fields Map to the Zélla AirB `AirbnbPropertyContext`

Below is the exact mapping from the `AirbnbPropertyContext` interface (defined in `/src/lib/strategies/ZellaAirBStrategy.ts`) to available Airbnb data.

### 2.1 Direct Mappings (Airbnb → Zélla AirB)

| Zélla AirB Field | Airbnb Source Field | Source | Extractable? | Notes |
|---|---|---|---|---|
| `id` | `property_id` | API/Scraper | ✅ Yes | Generate internally or use Airbnb ID |
| `name` | `name` | API/Scraper | ✅ Yes | Listing title |
| `airbnbListingId` | `property_id` | API/Scraper | ✅ Yes | Direct mapping |
| `type` | `property_type` / `room_type` | API/Scraper | ⚠️ Partial | Need to map: `entire_home`→`apartamento`/`casa`, `private_room`→`studio`. Requires human classification. |
| `address` | `address` / `street` | API/Scraper | ⚠️ Partial | Airbnb often redacts exact address for unbooked guests |
| `neighborhood` | `suburb` / `government_area` / `neighborhood_overview` | MongoDB/API | ⚠️ Partial | May need NLP on `neighborhood_overview` |
| `city` | `market` / `city` | API/Scraper | ✅ Yes | Usually available |
| `state` | parsed from address | — | ⚠️ Partial | Not always explicit; parse from full address |
| `latitude` | `latitude` | API/Scraper | ✅ Yes | Slightly randomized for privacy |
| `longitude` | `longitude` | API/Scraper | ✅ Yes | Slightly randomized for privacy |
| `houseRules` | `house_rules` | API/Scraper | ✅ Yes | Direct array mapping |
| `maxGuests` | `accommodates` / `guests` | API/Scraper | ✅ Yes | Direct mapping |
| `allowsPets` | parsed from `house_rules` / `amenities` | API/Scraper | ⚠️ Inference | Check "Pets allowed" in amenities or "No pets" in house rules |
| `allowsSmoking` | parsed from `house_rules` / `amenities` | API/Scraper | ⚠️ Inference | Check "Smoking allowed" in amenities or "No smoking" in house rules |
| `allowsParties` | parsed from `house_rules` | API/Scraper | ⚠️ Inference | Check "No parties or events" in house rules |
| `emergencyContacts` | — | — | ❌ Not available | Must be manually entered by host |
| `nearestHospital` | — | — | ❌ Not available | Can be derived via Google Maps API from lat/lng |
| `nearestPharmacy` | — | — | ❌ Not available | Can be derived via Google Maps API from lat/lng |

### 2.2 Fields NOT Available on Airbnb (Host-Only Data)

These fields are **private knowledge** that only the property owner knows. They are **not available** from any public listing page or API:

| Zélla AirB Field | Category | Solution |
|---|---|---|
| `checkInInstructions` | Access | Host onboarding form |
| `lockProvider` | Access | Host onboarding form |
| `lockCode` | Access | Host onboarding form |
| `wifiNetwork` | Access | Host onboarding form |
| `wifiPassword` | Access | Host onboarding form |
| `parkingInstructions` | Access | Host onboarding form |
| `quietHoursStart` | Rules | Host onboarding form (sometimes in house_rules text) |
| `quietHoursEnd` | Rules | Host onboarding form (sometimes in house_rules text) |
| `hostKnowledge[]` | Knowledge | Host onboarding form + AI extraction from description |
| `neighborhoodTips[]` | Local | AI extraction from `neighborhood_overview` + Google Places API |
| `equipment[]` | Knowledge | AI extraction from `detailed_amenities` + host onboarding |
| `emergencyContacts[]` | Safety | Host onboarding form |

### 2.3 Partially Extractable Fields (With AI/Heuristics)

| Zélla AirB Field | Strategy |
|---|---|
| `type` | Map `property_type`: `entire_home` + size heuristics → `apartamento`/`casa`/`loft` |
| `allowsPets` | Parse `amenities` for "Pets allowed" or `house_rules` for pet mentions |
| `allowsSmoking` | Parse `amenities` for "Smoking allowed" or `house_rules` for smoking mentions |
| `allowsParties` | Parse `house_rules` for "No parties" or "No events" |
| `quietHoursStart/End` | Parse `house_rules` text for patterns like "Quiet hours: 10pm-8am" |
| `neighborhoodTips[]` | Use LLM to extract from `neighborhood_overview` + `transit` fields, enrich with Google Places API |
| `equipment[]` | Parse `detailed_amenities` categories to identify equipment; instructions require host input |
| `hostKnowledge[]` (quirks) | Use LLM to extract quirks from `description`, `space`, `notes`, `access` fields |

---

## 3. Recommended Scraping Approach

### 3.1 Approach Comparison

| Approach | Data Completeness | Difficulty | Legal Risk | Cost | Reliability |
|---|---|---|---|---|---|
| **Third-party API** (StayingAPI, AirROI, RapidAPI) | ⭐⭐⭐⭐ | Easy | Low | $12-200/mo | High |
| **Scraper API** (ScrapeHero, BrightData, Oxylabs) | ⭐⭐⭐⭐⭐ | Medium | Medium | $50-500/mo | Medium |
| **Custom scraper** (Selenium/Puppeteer) | ⭐⭐⭐⭐⭐ | Hard | High | Infrastructure | Low (breaks often) |
| **Official Airbnb Partner API** | ⭐⭐⭐⭐⭐ | Very Hard | None (authorized) | Free (if approved) | High |
| **iCal feed** | ⭐ (calendar only) | Easy | None | Free | High |
| **Host onboarding form** (manual entry) | ⭐⭐⭐⭐⭐ | Easy | None | Dev time | Perfect |

### 3.2 RECOMMENDED: Hybrid Approach

For Zélla AirB specifically, the recommended strategy is a **3-layer hybrid**:

#### Layer 1: Third-Party Airbnb API (Auto-populate public data)
- **Use**: StayingAPI, AirROI API, or ScrapeHero Cloud
- **Purpose**: Auto-populate fields that ARE available publicly
- **Cost**: ~$12-60/month for typical usage
- **What it fills**: `name`, `airbnbListingId`, `type`, `address` (partial), `city`, `state`, `latitude`, `longitude`, `houseRules`, `maxGuests`, `allowsPets/Smoking/Parties` (inferred), `amenities` (for equipment mapping), `description`, `neighborhood_overview`

#### Layer 2: AI Extraction (Enrich from unstructured data)
- **Use**: LLM (GPT-4/Claude) to parse listing description
- **Purpose**: Extract structured data from free-text fields
- **What it fills**:
  - `type` → classify from `property_type` + `description`
  - `neighborhoodTips[]` → extract from `neighborhood_overview` + `transit`
  - `equipment[]` → generate from `detailed_amenities` (name + location only; instructions need host)
  - `hostKnowledge[]` quirks → extract unusual mentions from `description`, `space`, `notes`
  - `allowsPets/Smoking/Parties` → classify from `house_rules` text
  - `quietHoursStart/End` → extract from `house_rules` text

#### Layer 3: Host Onboarding Form (Private data only)
- **Use**: Web form in Zélla AirB dashboard
- **Purpose**: Collect data that is IMPOSSIBLE to get from any external source
- **What it fills**: `checkInInstructions`, `lockProvider`, `lockCode`, `wifiNetwork`, `wifiPassword`, `parkingInstructions`, `emergencyContacts[]`, `equipment[].instructions` + `whereIsRemote` + `troubleshooting`

### 3.3 Technical Implementation: Scraping via Third-Party API

```typescript
// Example: Using StayingAPI or similar third-party API
interface AirbnbListingResponse {
  id: string;
  name: string;
  description: string;
  property_type: string;
  accommodates: number;
  bedrooms: number;
  bathrooms: number;
  address: { street: string; city: string; country: string; };
  lat: number;
  lng: number;
  amenities: Record<string, string[]>;  // categorized
  house_rules: string[];
  price: { nightly: number; currency: string; };
  rating: number;
  reviews_count: number;
  host: {
    id: string;
    name: string;
    is_superhost: boolean;
    response_rate: number;
  };
  images: string[];
  checkin: string;
  checkout: string;
}
```

### 3.4 Why NOT Scrape Directly

1. **Airbnb ToS explicitly prohibits scraping**: "Do not scrape, hack, reverse engineer, compromise or impair the Airbnb Platform. Do not use bots, crawlers, scrapers, or other automated means."
2. **Anti-bot defenses**: Airbnb uses aggressive bot detection (CAPTCHAs, rate limiting, IP blocking, browser fingerprinting).
3. **hiQ vs. LinkedIn precedent**: While the CFAA likely doesn't apply to public data (hiQ v. LinkedIn, 2022), Airbnb can still pursue civil claims for breach of contract.
4. **Maintenance burden**: Airbnb frequently changes its HTML structure, API endpoints, and data format — custom scrapers break often.
5. **For Zélla AirB's use case**: The host is providing their OWN listing data, so using an API to read their own public listing is legally defensible.

---

## 4. Complete Data Mapping: Airbnb Field → Zélla AirB Field

### 4.1 Direct Mappings (Automated)

```
Airbnb                          Zélla AirB                        Confidence
─────────────────────────────── ────────────────────────────────── ──────────
property_id                 →   airbnbListingId                    100%
name                        →   name                               100%
property_type + room_type   →   type (with mapping table)          80%
address.street              →   address                            70% (often redacted)
address.suburb/gov_area     →   neighborhood                       70%
address.market              →   city                               95%
(parsed from address)       →   state                              60%
latitude                    →   latitude                           90% (slightly offset)
longitude                   →   longitude                          90% (slightly offset)
house_rules                 →   houseRules                         95%
accommodates                →   maxGuests                          100%
amenities includes "Pets"   →   allowsPets                         85%
amenities includes "Smoking"→   allowsSmoking                      85%
house_rules "No parties"    →   allowsParties=false                 85%
```

### 4.2 AI-Extracted Mappings (LLM-Assisted)

```
Airbnb                          Zélla AirB                        Method
─────────────────────────────── ────────────────────────────────── ──────────
description + space         →   hostKnowledge[] (quirks)           LLM extraction
neighborhood_overview       →   neighborhoodTips[] (partial)       LLM + Google Places
transit                     →   neighborhoodTips[] (transport)     LLM extraction
detailed_amenities          →   equipment[] (names only)           Category mapping
house_rules text            →   quietHoursStart/End                Regex/LLM
```

### 4.3 Host-Only Mappings (Manual Onboarding)

```
Zélla AirB Field             Source                              Priority
──────────────────────────── ──────────────────────────────────── ─────────
checkInInstructions          Host onboarding form                 HIGH
lockProvider                 Host onboarding form                 HIGH
lockCode                     Host onboarding form                 HIGH
wifiNetwork                  Host onboarding form                 HIGH
wifiPassword                 Host onboarding form                 HIGH
parkingInstructions          Host onboarding form                 MEDIUM
emergencyContacts[]          Host onboarding form                 MEDIUM
nearestHospital              Google Maps API from lat/lng         LOW
nearestPharmacy              Google Maps API from lat/lng         LOW
equipment[].instructions     Host onboarding form                 MEDIUM
equipment[].whereIsRemote    Host onboarding form                 LOW
equipment[].troubleshooting  Host onboarding form                 LOW
hostKnowledge[] (non-quirk)  Host onboarding form                 MEDIUM
neighborhoodTips[] (rich)    Host onboarding form + Google API    MEDIUM
```

---

## 5. Airbnb Page Data Embedding: Technical Details

### 5.1 Server-Side Rendered Data (Next.js)

Airbnb uses Next.js for its listing pages. The page HTML contains a `<script id="__NEXT_DATA__">` tag with the full React hydration data in JSON format. This is the richest source of structured data:

```html
<script id="__NEXT_DATA__" type="application/json">
{
  "props": {
    "pageProps": {
      "layoutData": {...},
      "niobeMinimalistData": {
        "queries": [{
          "data": {
            "presentation": {
              "ExploreSectionsQuery": {...},
              "PdpSectionsQuery": {
                "sections": {
                  "metadata": {
                    "listingId": "...",
                    "title": "...",
                    "coordinate": {...},
                    ...
                  },
                  "house_rules_section": {...},
                  "amenities_section": {...},
                  "description_section": {...}
                }
              }
            }
          }
        }]
      }
    }
  }
}
</script>
```

**Key paths in `__NEXT_DATA__`:**
- `props.pageProps.niobeMinimalistData.queries[].data.presentation.PdpSectionsQuery.sections`
- Within sections: `metadata`, `house_rules_section`, `amenities_section`, `description_section`, `host_section`, `reviews_section`, `location_section`

### 5.2 JSON-LD / Schema.org

**Airbnb does NOT embed JSON-LD structured data** (schema.org `LodgingBusiness`, `RealEstateListing`, etc.) on its listing pages. This was confirmed via Reddit discussions and our research — Airbnb intentionally avoids giving search engines structured access to their listing data.

### 5.3 Airbnb Internal API Endpoints (Observed)

Airbnb's frontend makes GraphQL API calls. Key observed endpoints:

```
POST https://www.airbnb.com/api/v3/ExploreSections
POST https://www.airbnb.com/api/v3/PdpSections
POST https://www.airbnb.com/api/v3/HomesPlacesSearch
POST https://www.airbnb.com/api/v3/StaysSearch
GET  https://www.airbnb.com/api/v2/reviews?listing_id={id}&_limit=20
```

These require valid session cookies and CSRF tokens — not suitable for direct programmatic access without authentication.

### 5.4 iCal Feed (Calendar Only)

Every Airbnb listing has an exportable iCal URL:
- Available at: Airbnb Dashboard → Listing → Availability → Calendar sync → Export calendar
- Contains: VEVENT entries with check-in/check-out dates
- Does NOT contain: listing details, amenities, rules, pricing
- Useful for: `availability` data and booking sync only

---

## 6. Legal / ToS Considerations

### 6.1 Airbnb Terms of Service (June 2024)

Airbnb's ToS explicitly states:
> "Do not scrape, hack, reverse engineer, compromise or impair the Airbnb Platform. Do not use bots, crawlers, scrapers, or other automated means to access the Airbnb Platform or collect or harvest any information from the Airbnb Platform."

### 6.2 Legal Landscape

| Aspect | Status |
|---|---|
| **CFAA (US)** | Likely does NOT apply to scraping public pages (hiQ v. LinkedIn, 9th Cir. 2022) |
| **Breach of Contract** | Airbnb CAN pursue civil claims for ToS violation |
| **Copyright** | Listing content (descriptions, photos) is copyrighted by hosts/Airbnb |
| **GDPR/Privacy** | Personal data (host info, reviews) has privacy implications in EU |
| **Computer Fraud** | Circumventing bot detection may constitute unauthorized access |

### 6.3 Safe Approaches for Zélla AirB

1. **Host provides their own listing URL** — the host authorizes data extraction from their own listing
2. **Third-party API** — legal liability falls on the API provider, not the consumer
3. **Official Partner API** — fully authorized, but requires Airbnb approval
4. **iCal sync** — fully authorized, built into Airbnb's product
5. **Manual entry** — zero legal risk

**RECOMMENDATION**: For Zélla AirB, since hosts are providing their own listing data, use a third-party API with the host's explicit consent. This is the most legally defensible approach.

---

## 7. Airbnb Official Integration Options

### 7.1 Airbnb Partner API (Official)

- **Access**: Invite-only program for approved PMS/channel managers
- **Capabilities**: Full listing management, calendar sync, messaging, booking management
- **How to get**: Apply at airbnb.com/software-partners or use an existing partner PMS
- **Approved partners**: Smoobu, OwnerRez, Guesty, Lodgify, Hostex, Hospitable, etc.
- **Use for Zélla AirB**: Could sync calendar, messaging, and listing data if we become a partner

### 7.2 iCal Calendar Sync

- **Available**: Built into every Airbnb listing
- **Sync**: One-way (Airbnb → external) or two-way (via channel manager)
- **Data**: Calendar availability only (no pricing, no listing details)
- **Use for Zélla AirB**: Perfect for checking availability when guest asks to extend stay

### 7.3 Channel Manager Integration

Channel managers that already have Airbnb Partner API access:
- **Smoobu** — Full API integration with Airbnb
- **OwnerRez** — Syncs availability, rates, rules, listing content, takes bookings
- **Guesty** — Full property management with Airbnb integration
- **Lodgify** — Website builder + Airbnb sync
- **Hostex** — Channel manager with API access
- **Hospitable** — Automated messaging + multi-platform sync
- **WebBookingPro** — Channel manager with iCal and API support

**Use for Zélla AirB**: Instead of building our own Airbnb API integration, we could partner with or integrate through an existing channel manager that already has Partner API access.

---

## 8. Implementation Roadmap for Zélla AirB

### Phase 1: MVP (Manual + Third-Party API)
1. Build host onboarding form for private data (WiFi, lockbox, etc.)
2. Integrate StayingAPI/AirROI for auto-populating public listing data
3. AI extraction layer to enrich from description/amenities
4. Store merged data as `AirbnbPropertyContext`

### Phase 2: Calendar Integration
1. Add iCal feed support for availability checking
2. Enable "extend stay" intent with real availability data
3. Optional: Connect via channel manager partner for 2-way sync

### Phase 3: Deep Integration (Future)
1. Apply for Airbnb Partner API access
2. Build direct messaging integration
3. Full booking lifecycle management

---

## Appendix A: `property_type` → Zélla `type` Mapping Table

```
Airbnb property_type         Zélla type       Confidence
─────────────────────────── ──────────────── ──────────
Entire home/apt             → apartamento      60% (default)
Entire home/apt + "house"   → casa             80%
Entire home/apt + "loft"    → loft             90%
Entire home/apt + "studio"  → studio           90%
Entire home/apt + "chalet"  → chalé            95%
Private room                → apartamento      50% (needs context)
Hotel room                  → apartamento      40% (needs context)
Shared room                 → apartamento      40% (needs context)
```

**Better approach**: Use LLM to classify from `name` + `description` + `property_type` + `bedrooms` count.

## Appendix B: `detailed_amenities` → `equipment[]` Mapping

```
Amenity Category            Equipment Mapping
─────────────────────────── ────────────────────────────────────────
"Heating and cooling"       → AC units, heaters, fans
"Entertainment"             → TV, speakers
"Kitchen and dining"        → Appliances (coffee maker, microwave, etc.)
"Services" → "Self check-in"→ Lockbox info (partial: type only)
"Services" → "Lockbox"      → lockProvider = "lockbox"
```

**Note**: `equipment.instructions`, `whereIsRemote`, and `troubleshooting` are NOT available from Airbnb and must come from the host.

## Appendix C: Third-Party API Provider Comparison

| Provider | Endpoints | Pricing | Data Quality | Best For |
|---|---|---|---|---|
| **StayingAPI** | 8 (search, details, amenities, reviews, host, policies, URL resolve) | Free tier → $60/mo | High | Zélla AirB (best fit) |
| **AirROI API** | 22 REST endpoints | $0.01-0.10/record | High | Market analytics |
| **ScrapeHero Cloud** | Full listing scrape | Credits-based | High | Bulk data |
| **RapidAPI (airbnb-api5)** | Search, details, pricing | Freemium | Medium | Quick integration |
| **SearchAPI.io** | Search + availability | $50+/mo | Medium | Search-focused |
| **Apify Airbnb Scraper** | Rooms, search, reviews, availability | Credits-based | High | Automation |
