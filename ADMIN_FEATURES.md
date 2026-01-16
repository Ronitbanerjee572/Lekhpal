# Admin Dashboard Features

## Overview
The Admin Dashboard (GovDashboard) now includes comprehensive approval management for three key areas:

1. **Land Registration Requests**
2. **Marketplace Buyer/Seller Approvals**
3. **Sale Listings Approvals**

---

## 1. Land Registration Management

### Features:
- **Direct Land Registration**: Register lands directly with owner address, khatian number, location details, and valuation
- **Pending Requests Review**: View all user-submitted land registration requests
- **Quick Approval**: Load request details into registration form with one click
- **Rejection with Reason**: Reject requests with mandatory rejection reason
- **Set Valuation**: Update valuation for existing lands
- **Approve Deals**: Approve pending escrow deals

### API Endpoints:
- `POST /blockchain/register-land` - Register a new land
- `POST /blockchain/set-valuation` - Update land valuation
- `POST /blockchain/approve-deal` - Approve escrow deal
- `GET /land-request/pending` - Get pending land requests
- `POST /land-request/approve` - Approve land request
- `POST /land-request/reject` - Reject land request

### Usage:
1. Navigate to **"Pending Requests"** tab
2. Review pending land registration requests
3. Click **"Approve"** to load details into registration form
4. Add valuation and submit, or click **"Reject"** to deny

---

## 2. Marketplace Role Management

### Features:
- **Buyer Approval**: Approve users to become buyers on the marketplace
- **Seller Approval**: Approve users to become sellers on the marketplace
- **Request Rejection**: Reject buyer/seller requests
- **Status Tracking**: View pending requests with user details (name, email, wallet, pin code)

### API Endpoints:
- `POST /marketplace/request-role` - User requests buyer/seller status
- `GET /marketplace/pending-requests` - Get pending buyer/seller requests (Admin only)
- `POST /marketplace/role-status` - Approve/reject buyer/seller requests (Admin only)

### User Flow:
1. Users request buyer/seller status from their dashboard
2. Admin views requests in **"Marketplace Requests"** tab
3. Admin reviews user details and wallet address
4. Admin approves or rejects the request

### Usage:
1. Navigate to **"Marketplace Requests"** tab
2. View separate sections for:
   - Pending Buyer Requests
   - Pending Seller Requests
3. Click **"Approve as Buyer/Seller"** or **"Reject"**

---

## 3. Sale Listings Management

### Features:
- **Listing Review**: View all pending sale listings submitted by approved sellers
- **Listing Details**: See land ID, seller info, price (in Wei and ETH), submission date
- **Approval**: Approve listings to make them publicly visible
- **Rejection with Reason**: Reject listings with mandatory rejection reason
- **Real-time Updates**: Automatic refresh after approval/rejection

### API Endpoints:
- `POST /marketplace/listings` - Submit sale listing (Seller only, requires approval)
- `GET /marketplace/pending-listings` - Get pending listings (Admin only)
- `POST /marketplace/listings/status` - Approve/reject listing (Admin only)
- `GET /marketplace/listings` - Get approved listings (Public)

### Seller Requirements:
- Must have **approved seller status**
- Can only list lands they own
- Listings enter **pending** status initially

### Usage:
1. Navigate to **"Sale Listings"** tab (4th tab)
2. Review pending sale listings with:
   - Land ID
   - Seller name, email, wallet
   - Price in Wei and ETH
   - Submission date
3. Click **"Approve Listing"** to approve
4. Click **"Reject"** and provide reason to deny

---

## Database Models

### User Model Extensions:
```javascript
{
  buyerStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
  sellerStatus: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' }
}
```

### SaleListing Model:
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  landId: { type: Number, required: true },
  priceWei: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

---

## Navigation Structure

### GovDashboard Tabs:
1. **Land Registration** - Register lands, set valuations, approve deals
2. **Pending Requests** (with count badge) - Land registration requests
3. **Marketplace Requests** (with count badge) - Buyer/seller approvals
4. **Sale Listings** (with count badge) - Sale listing approvals

### Tab Count Badges:
- Show real-time count of pending items
- Update automatically after admin actions

---

## Security & Permissions

### Admin Authentication:
- All admin endpoints protected with `adminOnly` middleware
- JWT token validation required
- Backend wallet must be registered as admin in smart contract

### Request Validation:
- User wallet addresses verified
- Seller status checked before listing submission
- Duplicate listing prevention
- ETH price validation (converted to Wei)

---

## UI/UX Features

### Visual Design:
- **Color Coding**:
  - Buyer requests: Indigo/Blue
  - Seller requests: Green
  - Sale listings: Purple
  - Pending status: Yellow badges
- **Responsive**: Mobile-optimized with responsive grid
- **Loading States**: Disabled buttons during processing
- **Success/Error Messages**: Toast notifications with auto-dismiss

### Rejection Workflow:
- Modal popup for rejection reason
- Required text input
- Confirm/Cancel actions
- Reason stored in database

---

## Testing Checklist

### Buyer/Seller Approval:
- [ ] User requests buyer status from UserDashboard
- [ ] Request appears in admin "Marketplace Requests" tab
- [ ] Admin approves request
- [ ] User status updates to "approved"
- [ ] User can now submit listings (if seller) or purchase (if buyer)

### Sale Listing Approval:
- [ ] Approved seller submits land listing
- [ ] Listing appears in admin "Sale Listings" tab
- [ ] Admin approves listing
- [ ] Listing appears in public marketplace
- [ ] Buyers can view and purchase

### Rejection Flow:
- [ ] Admin rejects request with reason
- [ ] User sees rejection status
- [ ] User can re-submit after addressing issues

---

## Future Enhancements

1. **Bulk Actions**: Approve/reject multiple requests at once
2. **Filters & Search**: Filter by status, date, user
3. **Analytics Dashboard**: Show approval rates, pending counts
4. **Email Notifications**: Notify users of approval/rejection
5. **Audit Logs**: Track all admin actions with timestamps
6. **Appeal System**: Allow users to appeal rejections
7. **Automated Approvals**: Auto-approve based on criteria (verified wallet, KYC)

---

## API Summary

### Admin-Only Endpoints:
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/land-request/pending` | GET | Get pending land requests |
| `/land-request/approve` | POST | Approve land request |
| `/land-request/reject` | POST | Reject land request |
| `/marketplace/pending-requests` | GET | Get pending buyer/seller requests |
| `/marketplace/role-status` | POST | Approve/reject marketplace role |
| `/marketplace/pending-listings` | GET | Get pending sale listings |
| `/marketplace/listings/status` | POST | Approve/reject sale listing |
| `/blockchain/register-land` | POST | Register new land |
| `/blockchain/set-valuation` | POST | Update land valuation |
| `/blockchain/approve-deal` | POST | Approve escrow deal |

---

## Deployment Notes

1. Ensure backend wallet is registered as admin in smart contract
2. Environment variables configured (`VITE_API_URL`)
3. MongoDB connection for storing requests and listings
4. Smart contract addresses in `contractConfig.js`

---

## Support & Troubleshooting

### Common Issues:

**Admin Dashboard Not Loading:**
- Verify JWT token in localStorage
- Check backend wallet is admin on blockchain
- Ensure API_URL is correct

**Pending Requests Not Showing:**
- Check MongoDB connection
- Verify admin middleware on routes
- Check browser console for errors

**Approval Not Working:**
- Ensure backend wallet has gas/ETH
- Check smart contract connection
- Verify land/user exists on chain

---

## Contact & Documentation

For more information, see:
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- Smart contracts in `/solidity` directory
- Backend API in `/server` directory
- Frontend components in `/src/pages`
