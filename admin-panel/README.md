# GramSetu Admin Panel - Government Schemes Management

A comprehensive web-based admin panel for government officials to manage schemes and review farmer applications.

## 🚀 Features

### Dashboard
- **Real-time Statistics**: Total schemes, applications, pending reviews, approval rates
- **Recent Applications**: Quick view of latest applications
- **Quick Stats**: Overview of application status distribution

### Schemes Management
- **Add New Schemes**: Create government schemes with full details
- **Edit/Delete Schemes**: Modify or remove existing schemes
- **Categorization**: Credit, Insurance, Subsidies, Technology, Training
- **Status Control**: Active, Coming Soon, Expired
- **Full Details**: Eligibility, documents required, benefits, deadlines

### Applications Review
- **View All Applications**: Comprehensive list with filtering
- **Search & Filter**: By farmer name, phone, Aadhar, status
- **Detailed View**: Complete application information
- **Review & Approve/Reject**: Update application status with remarks
- **Track History**: Review timeline and comments

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project (same as mobile app)
- Admin email account for authentication

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd admin-panel
npm install
```

### 2. Configure Firebase

Create `.env` file in the `admin-panel` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Note**: Use the same Firebase project credentials as your mobile app!

### 3. Create Admin User

In Firebase Console:
1. Go to Authentication → Users
2. Click "Add User"
3. Email: `admin@gramsetu.gov.in`
4. Password: `admin123` (or your secure password)
5. Click "Add User"

### 4. Set Up Firestore Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Government schemes - admins can write, everyone can read
    match /government_schemes/{schemeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Scheme applications - authenticated users can create, admins can update
    match /scheme_applications/{applicationId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Add other collections rules...
  }
}
```

### 5. Run the Admin Panel

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

The admin panel will open at `http://localhost:3000`

## 🔐 Login

Default credentials:
- **Email**: `admin@gramsetu.gov.in`
- **Password**: `admin123`

## 📱 How It Works with Mobile App

### Data Flow

1. **Schemes Creation** (Admin Panel):
   - Admin creates scheme in web panel
   - Saved to Firebase `government_schemes` collection
   - Automatically appears in mobile app

2. **Farmer Application** (Mobile App):
   - Farmer fills application form
   - Checks for duplicate applications
   - Validates eligibility
   - Submits to Firebase `scheme_applications`

3. **Application Review** (Admin Panel):
   - Official views application details
   - Reviews farmer information
   - Approves/Rejects with remarks
   - Status updated in real-time

4. **Status Tracking** (Mobile App):
   - Farmer sees updated status
   - Reads official remarks
   - Tracks application timeline

## 🎯 Application Status Flow

```
Pending → Under Review → Approved ✓
                      ↓
                   Documents Required → Under Review
                      ↓
                   Rejected ✗
```

## 📊 Features Breakdown

### Eligibility Checking (Automated)
- Land holding limits
- Document requirements
- Aadhar verification
- Bank account validation

### Scheme Categories
- 💰 Credit & Loans
- 🛡️ Insurance
- 🎯 Subsidies
- 🚜 Technology
- 📚 Training

### Application Filters
- All Applications
- Pending Review
- Under Review
- Approved
- Rejected
- Documents Required

## 🔄 Sync with Mobile App

Both admin panel and mobile app use the **same Firebase database**, ensuring:
- Real-time updates
- No data duplication
- Instant status changes
- Centralized management

## 🚧 Future Enhancements

- [ ] Document upload (Aadhar, land records, etc.)
- [ ] Bulk approval/rejection
- [ ] Export applications to Excel
- [ ] Email notifications to farmers
- [ ] SMS integration for status updates
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Role-based access (State/District officers)

## 🛡️ Security

- Firebase Authentication
- Secure environment variables
- Admin-only write access
- HTTPS encryption
- Input validation

## 📞 Support

For issues or questions:
1. Check Firebase Console for errors
2. Verify environment variables
3. Check browser console for errors
4. Ensure Firebase rules are updated

## 📝 License

Copyright © 2025 GramSetu. All rights reserved.
