// Dummy Plant Care Queries and Responses
// This file contains 20 natural plant care queries with location-based static responses

// Location-specific advice templates
const LOCATION_ADVICE = {
  lucknow: {
    water: "In Lucknow, you should water your plants early morning or late evening to avoid the hot afternoon sun. The climate here is warm, so plants may need more frequent watering.",
    fertilizer: "In Lucknow, use organic fertilizers during the monsoon season (July-September) for best results. The humid climate helps plants absorb nutrients better.",
    sunlight: "In Lucknow, provide partial shade during peak summer months (May-June) as the temperature can be very high. Morning sunlight is ideal.",
    general: "In Lucknow, the climate is subtropical with hot summers. Water plants regularly and provide shade during peak hours."
  },
  varanasi: {
    water: "In Varanasi, you should give plants little water during monsoon season but increase frequency during dry months. The Ganges climate requires careful water management.",
    fertilizer: "In Varanasi, apply organic compost during spring and autumn. The river climate is good for most plants.",
    sunlight: "In Varanasi, plants need morning sunlight but protect them from harsh afternoon sun, especially near the ghats.",
    general: "In Varanasi, the river climate is humid. Water moderately and ensure good drainage."
  },
  kanpur: {
    water: "In Kanpur, water your plants every 2-3 days during summer. The industrial climate can be dry, so mist leaves regularly.",
    fertilizer: "In Kanpur, use balanced fertilizers during growing season. The climate supports good plant growth with proper care.",
    sunlight: "In Kanpur, provide filtered sunlight as the air quality may affect plant health. Indoor plants do well here.",
    general: "In Kanpur, maintain regular watering schedule and protect plants from pollution by keeping them clean."
  },
  prayagraj: {
    water: "In Prayagraj, water plants moderately as the confluence climate is balanced. Check soil moisture before watering.",
    fertilizer: "In Prayagraj, fertilize during spring and monsoon. The river confluence provides good natural conditions.",
    sunlight: "In Prayagraj, most plants thrive with 4-6 hours of morning sunlight. Afternoon shade is beneficial.",
    general: "In Prayagraj, the climate is suitable for most plants. Regular care and moderate watering work best."
  }
};

// Dummy queries with responses
const DUMMY_QUERIES = {
  // Natural plant growing queries
  "how to grow lotus plants": "Lotus plants need a water container or pond. Plant them in heavy clay soil submerged in 6-12 inches of water. They need full sunlight for at least 6 hours daily. {location_advice} Fertilize monthly during growing season with aquatic plant fertilizer. Remove dead leaves regularly to keep the water clean.",
  
  "how to grow roses": "Roses need well-draining soil, at least 6 hours of direct sunlight, and regular watering. Plant them in a location with good air circulation. {location_advice} Water deeply 2-3 times per week during summer. Prune regularly to encourage new blooms. Use rose-specific fertilizer every 4-6 weeks during growing season. Protect from pests like aphids with neem oil spray.",
  
  "how to grow tomatoes": "Tomatoes need full sun (6-8 hours), well-draining soil rich in organic matter, and consistent watering. {location_advice} Plant them in early spring or late summer. Water at the base to avoid leaf diseases. Support with stakes or cages as they grow. Fertilize with balanced fertilizer when flowers appear. Harvest when fruits are firm and fully colored.",
  
  "how to grow mint": "Mint is easy to grow and spreads quickly. Plant in partial shade to full sun with moist, well-draining soil. {location_advice} Keep the soil consistently moist but not waterlogged. Mint grows well in containers to control spreading. Harvest leaves regularly to encourage new growth. It's perfect for beginners and grows year-round in most climates.",
  
  "how to grow basil": "Basil needs warm weather, full sun (6-8 hours), and well-draining soil. {location_advice} Plant after the last frost. Water when soil feels dry, usually every 2-3 days. Pinch off flower buds to encourage leaf growth. Harvest leaves from the top to promote bushier growth. Basil is sensitive to cold, so protect during winter months.",
  
  "how to grow aloe vera": "Aloe vera needs bright, indirect sunlight and well-draining sandy soil. {location_advice} Water deeply but infrequently - let soil dry completely between waterings (every 2-3 weeks). It's drought-tolerant and perfect for beginners. Plant in a pot with drainage holes. Avoid overwatering as it causes root rot. Fertilize lightly during spring and summer.",
  
  "how to grow tulsi": "Tulsi (Holy Basil) needs full sun, well-draining soil, and regular watering. {location_advice} Water daily during summer but reduce in monsoon. It grows well in pots or ground. Pinch flowers to encourage leaf growth. Tulsi is considered sacred and has medicinal properties. Protect from cold weather and frost.",
  
  "how to grow marigold": "Marigolds are easy to grow and need full sun (6-8 hours) and well-draining soil. {location_advice} Plant seeds directly in soil or start indoors. Water when soil is dry, usually every 2-3 days. They're pest-resistant and great companion plants. Deadhead spent flowers to encourage continuous blooming. Fertilize monthly during growing season.",
  
  "how to grow jasmine": "Jasmine needs full sun to partial shade, well-draining soil, and regular watering. {location_advice} Water deeply 2-3 times per week. Provide support for climbing varieties. Prune after flowering to maintain shape. Jasmine flowers are fragrant and bloom in summer. Fertilize with balanced fertilizer during growing season.",
  
  "how to grow curry leaves": "Curry leaf plants need full sun, well-draining soil, and moderate watering. {location_advice} Water when top inch of soil is dry. They're sensitive to cold, so protect during winter. Harvest leaves regularly to encourage new growth. Fertilize monthly during growing season. The plant can grow into a small tree if not pruned regularly.",
  
  // Care and maintenance queries
  "how to care for indoor plants": "Indoor plants need bright indirect light, well-draining soil, and proper watering. {location_advice} Place them near east or west-facing windows. Water when top 1-2 inches of soil is dry. Maintain humidity by misting or using a humidifier. Fertilize monthly during spring and summer. Clean leaves regularly to remove dust.",
  
  "how to care for outdoor plants": "Outdoor plants need appropriate sunlight based on species, well-draining soil, and regular watering. {location_advice} Water early morning or evening to prevent evaporation. Mulch around plants to retain moisture. Protect from extreme weather. Fertilize according to plant needs. Prune regularly to maintain health and shape.",
  
  "how to water plants properly": "Water plants when the top 1-2 inches of soil feel dry. {location_advice} Water early morning or late evening. Water deeply until it drains from bottom, then let soil dry before next watering. Avoid overwatering which causes root rot. Use room temperature water. Adjust frequency based on season and plant type.",
  
  "how to fertilize plants": "Fertilize plants during their active growing season (spring and summer). {location_advice} Use balanced fertilizer (10-10-10) for most plants. Dilute liquid fertilizers to half strength. Apply every 2-4 weeks during growing season. Reduce or stop fertilizing in fall and winter. Always water before and after fertilizing.",
  
  "how to repot plants": "Repot when roots fill the container or plant becomes top-heavy. {location_advice} Spring is the best time. Choose a pot 1-2 inches larger. Use fresh well-draining soil. Water thoroughly after repotting. Keep in shade for a few days to help recovery. Don't fertilize for 2-3 weeks after repotting.",
  
  // Problem-solving queries
  "why are my plants dying": "Check several factors: soil moisture (over/under watering), light conditions, pests, or root rot. {location_advice} Ensure proper drainage and avoid waterlogging. Examine leaves for pests. Adjust watering schedule. Move to appropriate light. Remove dead parts. If roots are damaged, repot with fresh soil.",
  
  "how to treat yellow leaves": "Yellow leaves can indicate overwatering, underwatering, or nutrient deficiency. {location_advice} Check soil moisture first. If wet, reduce watering. If dry, increase frequency. Remove yellow leaves. Apply balanced fertilizer if nutrient deficiency. Ensure proper drainage. Check for pests or diseases.",
  
  "how to get rid of plant pests": "For pests like aphids or mealybugs: isolate affected plant, wash with soapy water, apply neem oil spray. {location_advice} Treat early morning or evening. Repeat weekly until pests are gone. Use insecticidal soap for severe infestations. Keep plants clean and check regularly. Natural predators like ladybugs help control pests.",
  
  // Specific plant queries
  "how to grow money plant": "Money plants (Pothos) are easy to grow. {location_advice} Place in bright indirect light. Water when top inch of soil is dry. They can grow in water or soil. Fertilize monthly during growing season. Prune regularly to encourage bushier growth. They're perfect for beginners and very forgiving.",
  
  "how to grow snake plant": "Snake plants are very low maintenance. {location_advice} They need indirect light and infrequent watering (every 2-6 weeks). Let soil dry completely between waterings. They're drought-tolerant and perfect for beginners. Use well-draining soil. Fertilize 2-3 times during growing season. Avoid overwatering as it's the main cause of problems.",
  
  // Disease detection queries
  "what happened to my plant": "Based on the image you uploaded, I can see your plant has some issues. Let me analyze it for you.",
  "what is wrong with my plant": "Based on the image you uploaded, I can see your plant has some issues. Let me analyze it for you.",
  "my plant is sick": "Based on the image you uploaded, I can see your plant has some issues. Let me analyze it for you.",
  "plant disease": "Based on the image you uploaded, I can see your plant has some issues. Let me analyze it for you.",
  "what happened to my rice plant": "Based on the image you uploaded, I can see your rice plant has some issues. Let me analyze it for you.",
};

// Disease detection responses based on image analysis
export const getDiseaseDetectionResponse = (hasImage = false, location = "lucknow", query = "") => {
  if (!hasImage) {
    return "Please upload an image of your plant first, then ask 'what happened to my plant' for disease detection.";
  }
  
  const locationAdvice = LOCATION_ADVICE[location.toLowerCase()] || LOCATION_ADVICE["lucknow"];
  const queryLower = query.toLowerCase();
  
  // Check if it's a rice plant query
  if (queryLower.includes("rice")) {
    return getRicePlantDiseaseResponse(locationAdvice, location);
  }
  
  // Default disease detection for other plants
  return `🔍 **Disease Detection Results:**

**Disease Identified:** Leaf Spot Disease / Bacterial Leaf Spot

**Symptoms Observed:**
- Irregular dark red/brown spots on leaves
- White spots and patches on some leaves
- Discolored leaf patterns
- Possible fungal or bacterial infection

**Causes:**
- Overwatering leading to fungal growth
- Poor air circulation
- High humidity
- Water splashing on leaves

**Solution to Regrow Your Plant:**

1. **Immediate Actions:**
   - Remove all affected leaves immediately to prevent spread
   - Isolate the plant from other plants
   - Stop overhead watering - water only at the base
   - Improve air circulation around the plant

2. **Treatment:**
   - Apply neem oil spray (mix 2 tsp neem oil with 1 liter water) every 3-4 days
   - Use fungicide spray if infection is severe
   - Prune dead or dying leaves with sterilized scissors
   - ${locationAdvice.general}

3. **Preventive Measures:**
   - Water early morning so leaves dry quickly
   - Ensure proper drainage - don't let water sit in saucer
   - Space plants properly for better air flow
   - Avoid getting water on leaves when watering
   - Maintain moderate humidity levels

4. **Recovery Care:**
   - Place plant in bright, indirect light
   - Reduce watering frequency until plant recovers
   - Apply balanced fertilizer after 2-3 weeks of recovery
   - Monitor new growth - healthy new leaves indicate recovery
   - Be patient - recovery can take 2-4 weeks

5. **If Problem Persists:**
   - Consider repotting with fresh, well-draining soil
   - Check roots for rot - trim any brown/mushy roots
   - Use systemic fungicide for severe cases
   - Consult a local nursery for plant-specific treatment

**Expected Recovery Time:** 2-4 weeks with proper care

Your plant can recover with proper treatment and care. Follow these steps consistently, and you should see new healthy growth within a few weeks.`;
};

// Rice plant specific disease detection
const getRicePlantDiseaseResponse = (locationAdvice, location) => {
  return `🔍 **Rice Plant Disease Detection Results:**

**Disease Identified:** Bacterial Leaf Blight (Xanthomonas oryzae) / Brown Spot Disease

**Symptoms Observed:**
- Elongated yellowish-brown streaks running parallel to leaf veins
- Linear lesions along the length of leaves
- Discolored areas transitioning from green to yellow-brown
- Streaks following the venation pattern of rice leaves
- Multiple fragmented streaks on affected leaves

**Causes:**
- Bacterial infection (Xanthomonas oryzae pv. oryzae)
- High humidity and warm temperatures
- Waterlogged conditions
- Infected seeds or plant debris
- Wind and rain spreading bacteria
- ${locationAdvice.general}

**Solution to Regrow Your Rice Plant:**

1. **Immediate Actions:**
   - Remove and destroy severely affected leaves to prevent spread
   - Improve field drainage - ensure water doesn't stagnate
   - Avoid working in fields when plants are wet
   - Isolate affected areas if possible
   - In ${location}, ensure proper water management during monsoon season

2. **Treatment:**
   - Apply copper-based bactericides (e.g., Copper Oxychloride) at 2g per liter of water
   - Spray Streptomycin (500-1000 ppm) every 7-10 days
   - Use neem-based biopesticides as organic alternative
   - Apply 2-3 times with 10-day intervals
   - ${locationAdvice.water}

3. **Cultural Practices:**
   - Practice crop rotation - avoid planting rice in same field consecutively
   - Use certified disease-free seeds
   - Maintain proper spacing (20-25 cm between plants)
   - Remove and burn infected plant debris after harvest
   - Keep fields clean of weeds and volunteer rice plants

4. **Water Management:**
   - Practice intermittent irrigation - allow fields to dry between waterings
   - Maintain water level at 5-7 cm during early growth
   - Avoid deep flooding for extended periods
   - Drain fields completely before applying fertilizers
   - In ${location}, adjust irrigation based on local climate conditions

5. **Fertilization:**
   - Apply balanced NPK fertilizer (recommended: 120:60:60 kg/ha)
   - Avoid excessive nitrogen which makes plants more susceptible
   - Apply potash to strengthen plant resistance
   - Use organic compost to improve soil health
   - ${locationAdvice.fertilizer}

6. **Recovery Timeline:**
   - New healthy leaves should appear within 2-3 weeks
   - Complete recovery may take 4-6 weeks
   - Monitor for new symptoms and treat immediately
   - Harvest may be delayed but plant can recover

7. **Prevention for Next Season:**
   - Use resistant rice varieties (IR64, Swarna, etc.)
   - Treat seeds with hot water (52-54°C for 10 minutes) before planting
   - Practice proper field sanitation
   - Monitor fields regularly for early symptoms
   - Apply preventive sprays during vulnerable growth stages

**Expected Recovery Time:** 4-6 weeks with proper treatment

**Important Note:** Bacterial leaf blight can significantly reduce yield. Early detection and treatment are crucial. If more than 50% of leaves are affected, consider replanting with disease-resistant varieties.

Your rice plants can recover with proper treatment. Follow these steps consistently, especially water management and timely application of bactericides.`;
};

// Default response for unmatched queries
const DEFAULT_RESPONSE = "sorry i can't help you in this";

/**
 * Get response for a query with location-specific advice
 * @param {string} query - User's query
 * @param {string} location - User's location (default: "lucknow")
 * @returns {string} - Response with location-specific advice
 */
export const getResponseForQuery = (query, location = "lucknow") => {
  const queryLower = query.toLowerCase().trim();
  const locationLower = location.toLowerCase().trim();
  
  // Get location-specific advice
  const locationAdvice = LOCATION_ADVICE[locationLower] || LOCATION_ADVICE["lucknow"];
  
  // Try exact match first
  if (DUMMY_QUERIES[queryLower]) {
    let response = DUMMY_QUERIES[queryLower];
    // Replace {location_advice} placeholder with appropriate advice
    if (queryLower.includes("water")) {
      response = response.replace("{location_advice}", locationAdvice.water);
    } else if (queryLower.includes("fertiliz")) {
      response = response.replace("{location_advice}", locationAdvice.fertilizer);
    } else if (queryLower.includes("sun") || queryLower.includes("light")) {
      response = response.replace("{location_advice}", locationAdvice.sunlight);
    } else {
      response = response.replace("{location_advice}", locationAdvice.general);
    }
    return response;
  }
  
  // Try partial matching - check if any key phrase is in the query
  for (const [keyPhrase, responseTemplate] of Object.entries(DUMMY_QUERIES)) {
    // Check if key words from the query match
    const keyWords = keyPhrase.split(" ").filter(word => word.length > 3);
    const queryWords = queryLower.split(" ").filter(word => word.length > 3);
    
    // Check if significant words match
    const matchingWords = keyWords.filter(word => queryWords.includes(word));
    if (matchingWords.length >= 2 || keyPhrase.includes(queryLower) || queryLower.includes(keyPhrase)) {
      let response = responseTemplate;
      // Replace location advice
      if (queryLower.includes("water")) {
        response = response.replace("{location_advice}", locationAdvice.water);
      } else if (queryLower.includes("fertiliz")) {
        response = response.replace("{location_advice}", locationAdvice.fertilizer);
      } else if (queryLower.includes("sun") || queryLower.includes("light")) {
        response = response.replace("{location_advice}", locationAdvice.sunlight);
      } else {
        response = response.replace("{location_advice}", locationAdvice.general);
      }
      return response;
    }
  }
  
  // Try keyword matching for better coverage
  const plantKeywords = {
    "lotus": "how to grow lotus plants",
    "rose": "how to grow roses",
    "tomato": "how to grow tomatoes",
    "mint": "how to grow mint",
    "basil": "how to grow basil",
    "aloe": "how to grow aloe vera",
    "tulsi": "how to grow tulsi",
    "marigold": "how to grow marigold",
    "jasmine": "how to grow jasmine",
    "curry": "how to grow curry leaves",
    "money plant": "how to grow money plant",
    "snake plant": "how to grow snake plant",
    "indoor": "how to care for indoor plants",
    "outdoor": "how to care for outdoor plants",
    "water": "how to water plants properly",
    "fertiliz": "how to fertilize plants",
    "repot": "how to repot plants",
    "dying": "why are my plants dying",
    "yellow": "how to treat yellow leaves",
    "pest": "how to get rid of plant pests",
  };
  
  for (const [keyword, matchingQuery] of Object.entries(plantKeywords)) {
    if (queryLower.includes(keyword)) {
      if (DUMMY_QUERIES[matchingQuery]) {
        let response = DUMMY_QUERIES[matchingQuery];
        // Replace location advice
        if (queryLower.includes("water") || keyword === "water") {
          response = response.replace("{location_advice}", locationAdvice.water);
        } else if (queryLower.includes("fertiliz") || keyword === "fertiliz") {
          response = response.replace("{location_advice}", locationAdvice.fertilizer);
        } else if (queryLower.includes("sun") || queryLower.includes("light")) {
          response = response.replace("{location_advice}", locationAdvice.sunlight);
        } else {
          response = response.replace("{location_advice}", locationAdvice.general);
        }
        return response;
      }
    }
  }
  
  return DEFAULT_RESPONSE;
};

