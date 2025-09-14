# BOOKING WIZARD ANALYSIS - OLD vs NEW

## OLD WIZARD STRUCTURE (10 Steps)

### **Data Fields (from BookingData interface):**
```typescript
interface BookingData {
  client_email: string;          // Contact email
  client_name: string;           // Full name  
  disciplines: string[];         // Selected disciplines array
  distance_km: number;           // Distance for travel
  duration_minutes: number;      // Show duration
  event_address: string;         // Full event address
  event_date: string;           // YYYY-MM-DD format
  event_time: string;           // HH:MM format
  event_type: string;           // Type of event
  show_type: string;            // Type of show
  is_indoor: boolean;           // Indoor/outdoor venue
  needs_light: boolean;         // Lighting requirements
  needs_sound: boolean;         // Sound requirements  
  newsletter_opt_in: boolean;   // Marketing consent
  number_of_guests: number;     // Guest count
  special_requests: string;     // Additional requests
  team_size: number;           // Number of artists
  planning_status: string      // Event planning stage
}
```

### **Old Wizard Steps:**
1. **Intro** - Welcome/explanation
2. **Event Type** - Corporate, private, etc.
3. **Show Type** - Solo, group, etc. 
4. **Show Disciplines** - Specific skills/acts
5. **Artist Count** - Number of performers
6. **Location** - Address, indoor/outdoor, tech needs
7. **Date & Time** - When the event happens
8. **Special Wishes** - Additional requests
9. **Contact Details** - Name, email, etc.
10. **Showtime** - Final submission

## NEW WIZARD STRUCTURE (7 Steps)

### **Data Fields (current BookingData):**
```typescript
interface BookingData {
  eventType: string              // Step 1
  teamSize: string              // Step 2  
  performanceStyle: string[]    // Step 3
  venueType: string            // Step 4
  eventDate: string            // Step 5
  guestCount: string           // Step 5
  budget: string               // Step 5
  firstName: string            // Step 6
  lastName: string             // Step 6
  email: string                // Step 6
  phone: string                // Step 6
  company: string              // Step 6
  message: string              // Step 6
  termsAccepted: boolean       // Step 7
  marketingConsent: boolean    // Step 7
}
```

### **New Wizard Steps:**
1. **Event Type** - 4 visual cards 
2. **Team Size** - 3 visual cards
3. **Performance Style** - Multiple disciplines
4. **Venue Type** - Indoor/outdoor
5. **Event Details** - Date, guests, budget
6. **Contact Info** - Personal details
7. **Review & Submit** - Final confirmation

## 🚨 CRITICAL MISSING FIELDS

### **Missing from NEW wizard:**
- ❌ `event_time` - No time selection
- ❌ `event_address` - No address input
- ❌ `distance_km` - No distance calculation
- ❌ `duration_minutes` - No duration selection
- ❌ `is_indoor` - Basic indoor/outdoor only
- ❌ `needs_light` - No lighting requirements
- ❌ `needs_sound` - No sound requirements
- ❌ `planning_status` - No planning stage info
- ❌ `special_requests` - Only basic message field

### **Field Mapping Issues:**
- `client_name` vs `firstName + lastName`
- `disciplines` vs `performanceStyle` 
- `number_of_guests` vs `guestCount` (string vs number)
- `team_size` vs `teamSize` (number vs string)

## 📋 INTEGRATION RECOMMENDATIONS

### **Option 1: Enhanced Current Wizard (Recommended)**
Keep the visual 7-step approach but add missing fields:

**Step 4: Venue Details (Enhanced)**
- Indoor/Outdoor selection ✅ (exists)
- Event address input ❌ (add)
- Lighting needs ❌ (add)
- Sound needs ❌ (add)

**Step 5: Event Details (Enhanced)** 
- Date selection ✅ (exists)
- Time selection ❌ (add)
- Guest count ✅ (exists)
- Duration ❌ (add)
- Budget ✅ (exists)
- Planning status ❌ (add)

**Step 6: Contact & Requirements (Enhanced)**
- Contact info ✅ (exists)
- Special requests/message ✅ (exists, but enhance)

### **Option 2: Hybrid Approach**
- Keep visual cards for main selections (steps 1-3)
- Add detailed forms for logistics (steps 4-5)
- Maintain contact/review (steps 6-7)

## 🔧 PAYLOAD TRANSFORMATION NEEDED

### **Current Payload (NEW):**
```json
{
  "eventType": "firmenfeier",
  "teamSize": "solo", 
  "performanceStyle": ["jonglage", "akrobatik"],
  "venueType": "indoor",
  "eventDate": "2024-03-15",
  "guestCount": "50",
  "budget": "1000-2500",
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "phone": "+49123456789",
  "company": "ACME Corp",
  "message": "Special requests here",
  "termsAccepted": true,
  "marketingConsent": false
}
```

### **Required Payload (BACKEND):**
```json
{
  "client_email": "john@example.com",
  "client_name": "John Doe",
  "disciplines": ["jonglage", "akrobatik"], 
  "distance_km": 0,
  "duration_minutes": 30,
  "event_address": "Munich, Germany",
  "event_date": "2024-03-15",
  "event_time": "19:00",
  "event_type": "firmenfeier",
  "show_type": "solo",
  "is_indoor": true,
  "needs_light": false,
  "needs_sound": false,
  "newsletter_opt_in": false,
  "number_of_guests": 50,
  "special_requests": "Special requests here",
  "team_size": 1,
  "planning_status": "in_planning"
}
```

## 💡 IMMEDIATE ACTIONS

### **1. Fix Payload Transformation (High Priority)**
Create mapping function to convert new format to backend format:
```typescript
function transformToBackendPayload(newData: BookingData): OldBookingData {
  return {
    client_email: newData.email,
    client_name: `${newData.firstName} ${newData.lastName}`,
    disciplines: newData.performanceStyle,
    // ... map all other fields with defaults for missing ones
  }
}
```

### **2. Add Critical Missing Fields (Medium Priority)**
- Event address input
- Time selection
- Duration selection  
- Technical requirements (sound/lighting)

### **3. Enhance Existing Steps (Low Priority)**
- Better special requests section
- Planning status selection
- Distance calculation (based on address)

## 🎯 RECOMMENDATION

**Start with fixing the payload transformation immediately**, then discuss which missing fields are critical for your business needs. The new wizard has better UX but needs backend compatibility.