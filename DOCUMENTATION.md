# API Route: /api/addlead

## Endpoint Information

**URL:** `/api/addlead`  
**Method:** `POST`  
**Content-Type:** `application/json`

---

## Request Body Schema

### Required Fields

```json
{
  "name": "string (required)",
  "email": "string (required, must be valid email)",
  "phone": "string (required)",
  "campaign": "string (required, must be one of: morrisons, asda, sainsburys, coop, justeat, bolt, next, pcp, dpf, diesel)"
}
```

### Optional Fields

```json
{
  "status": "sold | nurture (default: nurture)",
  "dob": "string (date of birth)",
  "address": "string",
  "marketing": "string (e.g., 'Opt-in', 'Opt-out')",
  "privacyPolicy": "string (e.g., 'Accepted', 'Declined')",
  "step": "string (e.g., 'Step 1', 'Step 2', default: 'Step 1')"
}
```

### Campaign-Specific Fields

You can add any additional fields specific to your campaign. These will be stored dynamically.

---

## Example Requests

### Example 1: Basic Morrisons Lead

```bash
curl -X POST http://localhost:3000/api/addlead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@morrisons.com",
    "phone": "07123456789",
    "campaign": "morrisons"
  }'
```

### Example 2: Complete Lead with Optional Fields

```bash
curl -X POST http://localhost:3000/api/addlead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@asda.com",
    "phone": "07987654321",
    "campaign": "asda",
    "status": "sold",
    "dob": "1990-05-15",
    "address": "123 High Street, London, UK",
    "marketing": "Opt-in",
    "privacyPolicy": "Accepted",
    "step": "Step 3"
  }'
```

### Example 3: PCP Campaign with Specific Fields

```bash
curl -X POST http://localhost:3000/api/addlead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Wilson",
    "email": "bob@test.com",
    "phone": "07000000000",
    "campaign": "pcp",
    "lender": "LenderX",
    "agreementNumber": "AG12345",
    "agreementDate": "2024-01-15",
    "vehicleRegistration": "AB12CDE",
    "idSubmitted": "Y",
    "signedLOA": "Y"
  }'
```

### Example 4: Diesel/DPF Campaign

```bash
curl -X POST http://localhost:3000/api/addlead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Brown",
    "email": "alice@diesel.com",
    "phone": "07111111111",
    "campaign": "dpf",
    "vehicleRegistration": "XY34ZAB",
    "vehicleMake": "BMW",
    "vehicleModel": "X5",
    "leasePurchaseDate": "2023-09-01"
  }'
```

---

## Response Examples

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "Lead added successfully",
  "data": {
    "lead_id": "LEAD-1707052800000-123",
    "id": "LEAD-1707052800000-123",
    "name": "John Smith",
    "email": "john.smith@morrisons.com",
    "campaign": "morrisons",
    "createdAt": "2024-02-03 14:30"
  }
}
```

### Validation Error Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name is required",
    "Valid email is required",
    "Phone is required",
    "Campaign is required"
  ]
}
```

### Invalid JSON Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Invalid JSON in request body"
}
```

### Internal Server Error (500)

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details here"
}
```

---

## JavaScript/TypeScript Example

### Using Fetch API

```typescript
async function addLead(leadData: any) {
  try {
    const response = await fetch("/api/addlead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("Lead added successfully:", result.data);
      return result.data;
    } else {
      console.error("Failed to add lead:", result.errors || result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error adding lead:", error);
    throw error;
  }
}

// Usage
const newLead = {
  name: "Sarah Johnson",
  email: "sarah@example.com",
  phone: "07555555555",
  campaign: "sainsburys",
  status: "nurture",
  dob: "1995-03-20",
  address: "456 Market St, Manchester",
  marketing: "Opt-in",
  privacyPolicy: "Accepted",
};

addLead(newLead)
  .then((lead) => console.log("Created lead:", lead))
  .catch((error) => console.error("Error:", error));
```

### Using Axios

```typescript
import axios from "axios";

async function addLead(leadData: any) {
  try {
    const response = await axios.post("/api/addlead", leadData);
    console.log("Lead added successfully:", response.data.data);
    return response.data.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Validation errors:", error.response.data.errors);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
}
```

---

## React Form Example

```typescript
'use client';

import { useState } from 'react';

export default function AddLeadForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    campaign: 'morrisons',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/addlead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', phone: '', campaign: 'morrisons' });
        console.log('Lead created:', result.data);
      } else {
        setError(result.errors?.join(', ') || result.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="tel"
        placeholder="Phone"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <select
        value={formData.campaign}
        onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
        required
      >
        <option value="morrisons">Morrisons</option>
        <option value="asda">Asda</option>
        <option value="sainsburys">Sainsburys</option>
        <option value="pcp">PCP</option>
        <option value="dpf">DPF</option>
      </select>

      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Lead'}
      </button>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>Lead added successfully!</div>}
    </form>
  );
}
```

---

## Additional Notes

1. **Database Integration**: Currently uses in-memory storage. Replace `LEADS_DB` array with actual database calls (e.g., Prisma, MongoDB, PostgreSQL).

2. **Authentication**: Add authentication middleware to protect this endpoint in production.

3. **Rate Limiting**: Consider adding rate limiting to prevent abuse.

4. **Webhooks**: You can extend this to trigger webhooks or notifications when a new lead is added.

5. **Testing**: Use the GET endpoint `/api/addlead` to retrieve all stored leads for testing purposes.

---

## File Structure

Place this file in your Next.js app directory:

```
/app/api/addlead/route.ts
```
