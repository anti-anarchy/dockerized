// Mock data — replace with SELECT * FROM reports WHERE is_current=TRUE
// AND ST_Within(location, ST_MakeEnvelope(bbox)) via pg client
import type { NextApiRequest, NextApiResponse } from "next";
import type { PointFeature } from "@/types";

const MOCK_POINTS: PointFeature[] = [
  // Flood cluster near Kasarani / Garden Estate
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.845, -1.219] },
    properties: {
      point_id: "P-001", zone_id: "Z-001", infrastructure_name: "Garden Estate Housing",
      infrastructure_type: "Residential", disaster_type: "Flood", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Garden Estate Housing has sustained moderate flood damage with water levels reaching the first floor of several residential units. Two casualties have been reported on site. Emergency drainage teams are required to prevent further structural deterioration.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.847, -1.220] },
    properties: {
      point_id: "P-002", zone_id: "Z-001", infrastructure_name: "Kasarani Roundabout",
      infrastructure_type: "Transport & Communication", disaster_type: "Flood", damage_level: "Critical",
      casualties: 5, assigned: true, assigned_to: "Amina Yusuf", task_status: "assigned",
      report_summary: "Kasarani Roundabout has been critically damaged by severe flooding, with the road surface completely submerged. Five casualties have been confirmed at the scene. Traffic has been fully redirected as the intersection is impassable.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.848, -1.217] },
    properties: {
      point_id: "P-003", zone_id: "Z-001", infrastructure_name: "Kasarani Primary School",
      infrastructure_type: "School", disaster_type: "Flood", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Primary School has experienced significant flood damage affecting multiple classrooms and the administrative block. Three casualties have been reported and students have been evacuated. Structural assessment is underway to determine if the building is safe for re-entry.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.849, -1.216] },
    properties: {
      point_id: "P-004", zone_id: "Z-001", infrastructure_name: "Garden Estate Waterworks",
      infrastructure_type: "Utility", disaster_type: "Flood", damage_level: "Low",
      casualties: 1, assigned: false, assigned_to: null, task_status: "resolved",
      report_summary: "Garden Estate Waterworks has sustained minor flood damage to its perimeter infrastructure and access paths. One casualty was reported during the initial incident. Operations have resumed at reduced capacity while repairs are ongoing.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.846, -1.223] },
    properties: {
      point_id: "P-005", zone_id: "Z-001", infrastructure_name: "Kasarani Market",
      infrastructure_type: "Commercial", disaster_type: "Flood", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Market has been significantly impacted by floodwaters, with multiple vendor stalls destroyed and stored goods ruined. Two casualties have been reported among market workers. The main access road to the market remains partially blocked by debris.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.843, -1.221] },
    properties: {
      point_id: "P-006", zone_id: "Z-001", infrastructure_name: "Garden Estate Clinic",
      infrastructure_type: "Government", disaster_type: "Flood", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "resolved",
      report_summary: "Garden Estate Clinic has sustained moderate flood damage to its ground floor facilities. Three casualties were admitted and clinical operations have been temporarily suspended. Medical supplies are at risk due to water intrusion into storage areas.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.850, -1.222] },
    properties: {
      point_id: "P-007", zone_id: "Z-001", infrastructure_name: "Kasarani Low-Cost Residential",
      infrastructure_type: "Residential", disaster_type: "Flood", damage_level: "Critical",
      casualties: 6, assigned: true, assigned_to: "Brian Otieno", task_status: "assigned",
      report_summary: "Kasarani Low-Cost Residential Block has suffered critical structural damage from prolonged flooding. Six casualties have been reported with several residents trapped in upper floors. Emergency rescue operations are underway to evacuate remaining occupants.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.844, -1.214] },
    properties: {
      point_id: "P-008", zone_id: "Z-001", infrastructure_name: "Garden Estate Sports Ground",
      infrastructure_type: "Public Space", disaster_type: "Flood", damage_level: "Low",
      casualties: 0, assigned: false, assigned_to: null, task_status: "resolved",
      report_summary: "Garden Estate Sports Ground has experienced minor flood damage with standing water covering the pitch and surrounding facilities. There are no casualties at this location. Drainage improvements are needed before the site can be used again.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.848, -1.224] },
    properties: {
      point_id: "P-009", zone_id: "Z-001", infrastructure_name: "Kasarani Utility Junction",
      infrastructure_type: "Utility", disaster_type: "Flood", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Utility Junction has been impacted by floodwaters causing disruptions to electricity and water distribution in the area. Two casualties were reported among utility workers on site. Restoration work is in progress but hampered by continued water accumulation.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.842, -1.218] },
    properties: {
      point_id: "P-010", zone_id: "Z-001", infrastructure_name: "Garden Estate Community Hall",
      infrastructure_type: "Community", disaster_type: "Flood", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Garden Estate Community Hall has sustained moderate flood damage to its interior facilities and surrounding grounds. Two casualties have been reported during the evacuation process. The hall is currently being used as a temporary evacuation centre for displaced residents.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.846, -1.215] },
    properties: {
      point_id: "P-011", zone_id: "Z-001", infrastructure_name: "Kasarani Road Intersection",
      infrastructure_type: "Transport & Communication", disaster_type: "Flood", damage_level: "Critical",
      casualties: 4, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Road Intersection has suffered critical flood damage with the road surface completely undermined by water erosion. Four casualties have been confirmed at this location. Emergency road closures are in effect and alternative routes have been established.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.849, -1.2195] },
    properties: {
      point_id: "P-012", zone_id: "Z-001", infrastructure_name: "Garden Estate Fire Station",
      infrastructure_type: "Government", disaster_type: "Flood", damage_level: "Medium",
      casualties: 1, assigned: true, assigned_to: "Grace Wanjiru", task_status: "assigned",
      report_summary: "Garden Estate Fire Station has experienced moderate flood damage affecting ground-level equipment and vehicles. One casualty was reported and some emergency response vehicles are out of service. The station is operating at reduced capacity to serve the flood-affected area.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.8455, -1.2215] },
    properties: {
      point_id: "P-013", zone_id: "Z-001", infrastructure_name: "Kasarani Secondary School",
      infrastructure_type: "School", disaster_type: "Flood", damage_level: "Low",
      casualties: 0, assigned: false, assigned_to: null, task_status: "resolved",
      report_summary: "Kasarani Secondary School has sustained minor flood damage to its lower buildings and perimeter fencing. No casualties were reported at this site. Classes have been suspended as a precautionary measure while the buildings are inspected.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.8475, -1.213] },
    properties: {
      point_id: "P-014", zone_id: "Z-001", infrastructure_name: "Garden Estate Pharmacy",
      infrastructure_type: "Commercial", disaster_type: "Flood", damage_level: "Low",
      casualties: 0, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Garden Estate Pharmacy has experienced minor flooding of its ground floor with some medical stock compromised. No casualties were reported. The pharmacy has temporarily relocated operations to the upper floor to continue serving the community.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.8462, -1.2245] },
    properties: {
      point_id: "P-015", zone_id: "Z-001", infrastructure_name: "Kasarani Solar Utility",
      infrastructure_type: "Utility", disaster_type: "Flood", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Solar Utility installation has been partially damaged by floodwaters reducing power output to the surrounding area. Two casualties were reported among maintenance personnel. Emergency generator units have been deployed to compensate for the power reduction.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.8448, -1.2122] },
    properties: {
      point_id: "P-016", zone_id: "Z-001", infrastructure_name: "Garden Estate Bus Stop",
      infrastructure_type: "Transport & Communication", disaster_type: "Flood", damage_level: "Low",
      casualties: 0, assigned: false, assigned_to: null, task_status: "resolved",
      report_summary: "Garden Estate Bus Stop has sustained minor flood damage to its shelter and surrounding paving. No casualties were reported at this location. Bus services have been suspended along this route until the area is deemed safe.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.8498, -1.2232] },
    properties: {
      point_id: "P-017", zone_id: "Z-001", infrastructure_name: "Kasarani Food Market",
      infrastructure_type: "Commercial", disaster_type: "Flood", damage_level: "Medium",
      casualties: 4, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Food Market has been severely impacted by floodwaters with perishable goods destroyed and stalls damaged. Four casualties have been reported among market workers. A large quantity of debris is blocking the market entrance and requires urgent clearance.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.8435, -1.2177] },
    properties: {
      point_id: "P-018", zone_id: "Z-001", infrastructure_name: "Garden Estate Soccer Pitch",
      infrastructure_type: "Public Space", disaster_type: "Flood", damage_level: "Low",
      casualties: 1, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Garden Estate Soccer Pitch has sustained minor flood damage with standing water across the entire playing surface. One casualty was reported in an adjacent area. The facility is temporarily closed and flood barriers have been installed to protect nearby residential properties.",
    },
  },
  // Fire cluster near Zimmerman / Kasarani Road
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.903, -1.212] },
    properties: {
      point_id: "P-019", zone_id: "Z-002", infrastructure_name: "Zimmerman Mini Mall",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Critical",
      casualties: 7, assigned: true, assigned_to: "Cynthia Kamau", task_status: "assigned",
      report_summary: "Zimmerman Mini Mall has suffered critical fire damage with most of the structure destroyed in the blaze. Seven casualties have been confirmed including staff and shoppers. The fire has been extinguished but the building is structurally unsafe and has been cordoned off.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.901, -1.210] },
    properties: {
      point_id: "P-020", zone_id: "Z-002", infrastructure_name: "Kasarani Road Petrol Station",
      infrastructure_type: "Utility", disaster_type: "Fire", damage_level: "Critical",
      casualties: 8, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Road Petrol Station has experienced a catastrophic fire following a fuel leak resulting in critical damage to all structures. Eight casualties have been confirmed with several critically injured. The site poses ongoing explosion risk and has been fully evacuated.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.898, -1.208] },
    properties: {
      point_id: "P-021", zone_id: "Z-002", infrastructure_name: "Zimmerman Residential Block",
      infrastructure_type: "Residential", disaster_type: "Fire", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Zimmerman Residential Block has sustained significant fire damage to its upper floors with residents evacuated. Three casualties were reported including two suffering smoke inhalation. Structural engineers are assessing the building before residents can return.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.905, -1.214] },
    properties: {
      point_id: "P-022", zone_id: "Z-002", infrastructure_name: "Kasarani Transport Hub",
      infrastructure_type: "Transport & Communication", disaster_type: "Fire", damage_level: "Critical",
      casualties: 6, assigned: true, assigned_to: "Grace Wanjiru", task_status: "assigned",
      report_summary: "Kasarani Transport Hub has been critically damaged by fire with the main terminal building destroyed. Six casualties have been confirmed and transport services are completely suspended. Emergency response teams are on site managing rescue operations.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.907, -1.211] },
    properties: {
      point_id: "P-023", zone_id: "Z-002", infrastructure_name: "Zimmerman Gas Depot",
      infrastructure_type: "Utility", disaster_type: "Fire", damage_level: "Critical",
      casualties: 5, assigned: true, assigned_to: "Francis Kimani", task_status: "assigned",
      report_summary: "Zimmerman Gas Depot has suffered a critical fire triggered by a gas cylinder rupture. Five casualties have been reported and secondary explosions are feared. The surrounding 200-metre radius has been evacuated as a precautionary measure.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.904, -1.216] },
    properties: {
      point_id: "P-024", zone_id: "Z-002", infrastructure_name: "Kasarani Community Hall",
      infrastructure_type: "Community", disaster_type: "Fire", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Community Hall has sustained moderate fire damage to its main hall and kitchen facilities. Three casualties were reported during the evacuation. The hall has been temporarily closed and alternative community gathering spaces have been identified.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.900, -1.207] },
    properties: {
      point_id: "P-025", zone_id: "Z-002", infrastructure_name: "Zimmerman Clinic",
      infrastructure_type: "Government", disaster_type: "Fire", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Zimmerman Clinic has experienced fire damage to its administrative wing. Two casualties were reported among staff. Medical services have been partially relocated to the Kasarani District Hospital while repairs are carried out.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.899, -1.213] },
    properties: {
      point_id: "P-026", zone_id: "Z-002", infrastructure_name: "Kasarani Secondary School",
      infrastructure_type: "School", disaster_type: "Fire", damage_level: "Low",
      casualties: 0, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Secondary School has sustained minor fire damage to a storage block with the main school buildings unaffected. No casualties were reported and the fire was quickly contained. Classes are expected to resume within 48 hours.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.906, -1.209] },
    properties: {
      point_id: "P-027", zone_id: "Z-002", infrastructure_name: "Zimmerman Electrical Substation",
      infrastructure_type: "Utility", disaster_type: "Fire", damage_level: "Critical",
      casualties: 4, assigned: true, assigned_to: "Amina Yusuf", task_status: "assigned",
      report_summary: "Zimmerman Electrical Substation has suffered critical fire damage causing widespread power outages across the area. Four casualties were reported among electrical workers on duty. Emergency power restoration is underway with affected zones prioritised by vulnerability.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.902, -1.205] },
    properties: {
      point_id: "P-028", zone_id: "Z-002", infrastructure_name: "Zimmerman Mini Depot",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Zimmerman Mini Depot has sustained moderate fire damage to its storage and loading areas. Three casualties were reported among warehouse staff. Inventory has been partially destroyed and the site is closed pending safety assessment.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.908, -1.2135] },
    properties: {
      point_id: "P-029", zone_id: "Z-002", infrastructure_name: "Kasarani School Annex",
      infrastructure_type: "School", disaster_type: "Fire", damage_level: "Low",
      casualties: 1, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani School Annex has experienced minor fire damage to one classroom block. One casualty suffered minor burns and was treated on site. Classes in the affected block have been relocated and regular school operations continue in undamaged buildings.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.905, -1.218] },
    properties: {
      point_id: "P-030", zone_id: "Z-002", infrastructure_name: "Zimmerman Market",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Zimmerman Market has been significantly damaged by fire with multiple market stalls and vendor goods destroyed. Two casualties were reported. The market has been closed and a clean-up operation is underway to remove debris and hazardous materials.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.9005, -1.2115] },
    properties: {
      point_id: "P-031", zone_id: "Z-002", infrastructure_name: "Kasarani Small Clinic",
      infrastructure_type: "Government", disaster_type: "Fire", damage_level: "Medium",
      casualties: 1, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kasarani Small Clinic has sustained fire damage to its consultation rooms and pharmacy area. One casualty was reported among nursing staff. The clinic has been temporarily closed and patients are being directed to nearby medical facilities.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.9045, -1.2145] },
    properties: {
      point_id: "P-032", zone_id: "Z-002", infrastructure_name: "Zimmerman Workshop",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Low",
      casualties: 0, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Zimmerman Workshop has experienced minor fire damage to its tool storage area. No casualties were reported as the building was unoccupied at the time. Equipment loss is estimated to be moderate and the workshop is expected to resume operations shortly.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.9075, -1.2105] },
    properties: {
      point_id: "P-033", zone_id: "Z-002", infrastructure_name: "Kasarani Utility Hub",
      infrastructure_type: "Utility", disaster_type: "Fire", damage_level: "Critical",
      casualties: 6, assigned: true, assigned_to: "Brian Otieno", task_status: "assigned",
      report_summary: "Kasarani Utility Hub has suffered critical fire damage severely disrupting electricity and water services for a large portion of the district. Six casualties have been confirmed among on-duty staff. Emergency utility teams have been deployed to restore services as quickly as possible.",
    },
  },
  // Landslide cluster near Kariobangi / Dandora
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.890, -1.235] },
    properties: {
      point_id: "P-034", zone_id: "Z-003", infrastructure_name: "Kariobangi Road",
      infrastructure_type: "Transport & Communication", disaster_type: "Landslide", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kariobangi Road has sustained moderate landslide damage with large sections of the road blocked by rock and soil debris. Three casualties were reported among motorists and road workers. Clearance operations are underway but access remains restricted.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.888, -1.233] },
    properties: {
      point_id: "P-035", zone_id: "Z-003", infrastructure_name: "Dandora Slopes Residential",
      infrastructure_type: "Residential", disaster_type: "Landslide", damage_level: "Critical",
      casualties: 6, assigned: true, assigned_to: "David Mwangi", task_status: "assigned",
      report_summary: "Dandora Slopes Residential area has suffered critical landslide damage with several houses completely buried under debris. Six casualties have been confirmed and search-and-rescue operations are ongoing. The area remains at high risk of further slides due to unstable ground.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.889, -1.237] },
    properties: {
      point_id: "P-036", zone_id: "Z-003", infrastructure_name: "Kariobangi School",
      infrastructure_type: "School", disaster_type: "Landslide", damage_level: "Low",
      casualties: 1, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kariobangi School has sustained minor landslide damage to its perimeter wall and sports grounds. One casualty was reported among school maintenance staff. Classes have been suspended and students are being accommodated at alternative locations.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.892, -1.236] },
    properties: {
      point_id: "P-037", zone_id: "Z-003", infrastructure_name: "Dandora Recyclers Hub",
      infrastructure_type: "Commercial", disaster_type: "Landslide", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Dandora Recyclers Hub has been affected by landslide debris partially burying the facility. Two casualties were reported among workers. Collection and processing operations have been halted while structural stability is assessed.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.887, -1.231] },
    properties: {
      point_id: "P-038", zone_id: "Z-003", infrastructure_name: "Kariobangi Health Post",
      infrastructure_type: "Government", disaster_type: "Landslide", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kariobangi Health Post has experienced moderate landslide damage to its access road and external structures. Three casualties were brought in for treatment following the event. The health post remains operational but access by emergency vehicles is severely restricted.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.891, -1.232] },
    properties: {
      point_id: "P-039", zone_id: "Z-003", infrastructure_name: "Dandora Community Centre",
      infrastructure_type: "Community", disaster_type: "Landslide", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Dandora Community Centre has sustained moderate damage from landslide debris blocking its entrance and damaging the front structure. Two casualties were reported. The centre has been temporarily closed and is being evaluated for use as an emergency coordination point.",
    },
  },
  // Additional points across the 50km region
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.780, -1.380] },
    properties: {
      point_id: "P-040", zone_id: "Z-004", infrastructure_name: "Embakasi Industrial Park",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Critical",
      casualties: 8, assigned: true, assigned_to: "Cynthia Kamau", task_status: "assigned",
      report_summary: "Embakasi Industrial Park has suffered a large-scale fire destroying multiple warehouses and production facilities. Eight casualties have been confirmed and the fire is still being actively suppressed. Toxic smoke is dispersing in the direction of nearby residential areas.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.785, -1.378] },
    properties: {
      point_id: "P-041", zone_id: "Z-004", infrastructure_name: "Embakasi Warehouse",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Medium",
      casualties: 4, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Embakasi Warehouse has sustained significant fire damage to its main storage building. Four casualties were reported among warehouse staff. Emergency teams have contained the fire but large sections of the facility are structurally compromised.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.792, -1.375] },
    properties: {
      point_id: "P-042", zone_id: "Z-004", infrastructure_name: "Airport Logistics Depot",
      infrastructure_type: "Transport & Communication", disaster_type: "Fire", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Airport Logistics Depot has been damaged by fire originating from a nearby building. Three casualties were reported and cargo operations have been suspended. The fire has been extinguished and airport operations remain functional.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.795, -1.382] },
    properties: {
      point_id: "P-043", zone_id: "Z-004", infrastructure_name: "Embakasi Clinic",
      infrastructure_type: "Government", disaster_type: "Fire", damage_level: "Low",
      casualties: 1, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Embakasi Clinic has sustained minor fire damage to its administrative wing from an adjacent fire. One casualty was reported. Medical services continue with minimal disruption and patients are being seen in temporary consultation areas.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.798, -1.379] },
    properties: {
      point_id: "P-044", zone_id: "Z-004", infrastructure_name: "Airport Road Housing",
      infrastructure_type: "Residential", disaster_type: "Fire", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Airport Road Housing complex has experienced moderate fire damage to two residential blocks. Two casualties have been reported and residents have been evacuated to a nearby reception centre. Structural assessment is in progress to determine safe return dates.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.765, -1.414] },
    properties: {
      point_id: "P-045", zone_id: "Z-005", infrastructure_name: "South B Road",
      infrastructure_type: "Transport & Communication", disaster_type: "Flood", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "South B Road has sustained moderate flood damage with sections of road surface washed away. Two casualties were reported among pedestrians. The road is partially closed and traffic is being redirected through alternative routes.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.760, -1.410] },
    properties: {
      point_id: "P-046", zone_id: "Z-005", infrastructure_name: "South B Estate",
      infrastructure_type: "Residential", disaster_type: "Flood", damage_level: "Low",
      casualties: 1, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "South B Estate has experienced minor flood damage with ground-floor units inundated with shallow floodwater. One casualty was reported. Residents have been advised to remain on upper floors while water levels recede.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.755, -1.405] },
    properties: {
      point_id: "P-047", zone_id: "Z-005", infrastructure_name: "South B Market",
      infrastructure_type: "Commercial", disaster_type: "Flood", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "South B Market has been impacted by flooding with vendor stalls and stored goods damaged. Two casualties were reported among market traders. The market has been temporarily closed pending water drainage and safety inspection.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.750, -1.408] },
    properties: {
      point_id: "P-048", zone_id: "Z-005", infrastructure_name: "South B School",
      infrastructure_type: "School", disaster_type: "Flood", damage_level: "Low",
      casualties: 0, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "South B School has sustained minor flood damage to its playground and lower buildings. No casualties were reported and the school has been evacuated as a precaution. Classes are expected to resume once the site has been inspected.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.755, -1.420] },
    properties: {
      point_id: "P-049", zone_id: "Z-005", infrastructure_name: "South B Health Centre",
      infrastructure_type: "Government", disaster_type: "Flood", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "South B Health Centre has experienced moderate flood damage to its ground-floor consultation rooms. Three casualties were admitted following the flood event. The health centre is operating on reduced capacity with upper-floor facilities in use.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.720, -1.450] },
    properties: {
      point_id: "P-050", zone_id: "Z-006", infrastructure_name: "Ruai Agricultural Estate",
      infrastructure_type: "Commercial", disaster_type: "Landslide", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Ruai Agricultural Estate has suffered moderate landslide damage to its crop production areas and access roads. Three casualties were reported among farm workers. Significant crop losses are expected and replanting will be required once the land is stabilised.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.725, -1.455] },
    properties: {
      point_id: "P-051", zone_id: "Z-006", infrastructure_name: "Ruai Utility Station",
      infrastructure_type: "Utility", disaster_type: "Landslide", damage_level: "Critical",
      casualties: 5, assigned: true, assigned_to: "Francis Kimani", task_status: "assigned",
      report_summary: "Ruai Utility Station has sustained critical damage from a landslide that engulfed part of the facility. Five casualties have been confirmed and power and water supply to surrounding areas have been severely disrupted. Emergency restoration crews are on site.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.735, -1.448] },
    properties: {
      point_id: "P-052", zone_id: "Z-006", infrastructure_name: "Ruai Residential Block",
      infrastructure_type: "Residential", disaster_type: "Landslide", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Ruai Residential Block has experienced moderate landslide damage to its western wing. Two casualties were reported and affected residents have been relocated to emergency accommodation. Engineers are assessing the structural integrity before any re-entry can be permitted.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.820, -1.525] },
    properties: {
      point_id: "P-053", zone_id: "Z-007", infrastructure_name: "Kileleshwa Park",
      infrastructure_type: "Public Space", disaster_type: "Flood", damage_level: "Low",
      casualties: 1, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kileleshwa Park has sustained minor flood damage with most recreational areas submerged under shallow water. One casualty was reported near the main entrance. The park has been temporarily closed and flood drainage work is underway.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.825, -1.522] },
    properties: {
      point_id: "P-054", zone_id: "Z-007", infrastructure_name: "Kileleshwa School",
      infrastructure_type: "School", disaster_type: "Flood", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kileleshwa School has experienced moderate flood damage to its ground-level classrooms and library. Three casualties were reported during the evacuation. The school has been closed and remote learning protocols have been activated for students.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.830, -1.527] },
    properties: {
      point_id: "P-055", zone_id: "Z-007", infrastructure_name: "Kileleshwa Clinic",
      infrastructure_type: "Government", disaster_type: "Flood", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kileleshwa Clinic has sustained moderate flood damage to its ground floor including the pharmacy and maternity ward. Two casualties were treated for flood-related injuries. The clinic is operating with reduced services from the upper floor.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.832, -1.519] },
    properties: {
      point_id: "P-056", zone_id: "Z-007", infrastructure_name: "Kileleshwa High School",
      infrastructure_type: "School", disaster_type: "Flood", damage_level: "Low",
      casualties: 0, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kileleshwa High School has suffered minor flood damage to its sports facilities and perimeter infrastructure. No casualties were reported. School operations are continuing normally in the main buildings while the affected areas are cleared.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.828, -1.523] },
    properties: {
      point_id: "P-057", zone_id: "Z-007", infrastructure_name: "Kileleshwa Commercial Strip",
      infrastructure_type: "Commercial", disaster_type: "Flood", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Kileleshwa Commercial Strip has sustained moderate flood damage across multiple retail units. Three casualties were reported among staff and shoppers. Most businesses have suspended operations and floodwater clearance is in progress.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.880, -1.160] },
    properties: {
      point_id: "P-058", zone_id: "Z-008", infrastructure_name: "Central Business Plaza",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Critical",
      casualties: 9, assigned: true, assigned_to: "Amina Yusuf", task_status: "assigned",
      report_summary: "Central Business Plaza has been critically damaged by a major fire that swept through multiple floors of the building. Nine casualties have been confirmed and emergency services are still active at the scene. The building has been condemned and surrounding streets are closed.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.882, -1.158] },
    properties: {
      point_id: "P-059", zone_id: "Z-008", infrastructure_name: "City Transport Hub",
      infrastructure_type: "Transport & Communication", disaster_type: "Fire", damage_level: "Medium",
      casualties: 4, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "City Transport Hub has sustained moderate fire damage to its main concourse and ticketing area. Four casualties were reported. Transportation services have been suspended and passengers are being redirected to alternative terminals.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.878, -1.162] },
    properties: {
      point_id: "P-060", zone_id: "Z-008", infrastructure_name: "Central Mall",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Low",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Central Mall has experienced minor fire damage to its food court area. Two casualties were treated for smoke inhalation. The mall has been partially closed while fire damage assessment is conducted and fire suppression systems are inspected.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.890, -1.170] },
    properties: {
      point_id: "P-061", zone_id: "Z-009", infrastructure_name: "Upperhill Office Park",
      infrastructure_type: "Commercial", disaster_type: "Fire", damage_level: "Medium",
      casualties: 3, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Upperhill Office Park has sustained moderate fire damage to one of its office towers. Three casualties were reported among building occupants. The affected tower has been evacuated and tenants are working remotely while repairs are assessed.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.900, -1.175] },
    properties: {
      point_id: "P-062", zone_id: "Z-009", infrastructure_name: "Upperhill Clinic",
      infrastructure_type: "Government", disaster_type: "Fire", damage_level: "Medium",
      casualties: 2, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Upperhill Clinic has suffered moderate fire damage to its diagnostic equipment and administrative wing. Two casualties were treated on site. Clinical services have been partially suspended while the facility undergoes emergency repairs.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.910, -1.180] },
    properties: {
      point_id: "P-063", zone_id: "Z-010", infrastructure_name: "Muthaiga Road",
      infrastructure_type: "Transport & Communication", disaster_type: "Landslide", damage_level: "Medium",
      casualties: 4, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Muthaiga Road has been significantly blocked by landslide debris rendering the main carriageway impassable. Four casualties were reported among motorists and roadside workers. Heavy machinery is being brought in to clear the debris and restore traffic flow.",
    },
  },
  {
    type: "Feature",
    geometry: { type: "Point", coordinates: [36.915, -1.185] },
    properties: {
      point_id: "P-064", zone_id: "Z-010", infrastructure_name: "Muthaiga Residential Estate",
      infrastructure_type: "Residential", disaster_type: "Landslide", damage_level: "Low",
      casualties: 1, assigned: false, assigned_to: null, task_status: "unassigned",
      report_summary: "Muthaiga Residential Estate has sustained minor landslide damage to its perimeter walls and garden areas. One casualty was reported among grounds maintenance staff. Most residential units are intact and residents have been advised to stay indoors while debris is cleared.",
    },
  },
];

function inBbox(coords: number[], west: number, south: number, east: number, north: number): boolean {
  const [lng, lat] = coords;
  return lng >= west && lng <= east && lat >= south && lat <= north;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { bbox, active_session_id } = req.query;
  if (typeof active_session_id === "string") {
    console.log("active_session_id:", active_session_id);
  }

  const bboxNums =
    typeof bbox === "string" ? bbox.split(",").map(Number) : [36.82, -1.3, 36.94, -1.17];
  const [west, south, east, north] = bboxNums;

  const points = MOCK_POINTS.filter((point) =>
    inBbox(point.geometry.coordinates, west, south, east, north)
  );

  return res.status(200).json({ points });
}
