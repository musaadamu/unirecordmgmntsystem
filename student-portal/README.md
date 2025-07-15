# University Student Portal

A modern, responsive React.js frontend application for university students to manage their academic life, including courses, grades, payments, and more.

## 🚀 Features

### Phase 4: Student Portal Development

- **Student Authentication** - Secure login and session management
- **Academic Dashboard** - Overview of academic progress and important information
- **Course Management** - View enrolled courses, course materials, and schedules
- **Grade Tracking** - View grades, transcripts, and academic progress
- **Payment Management** - Pay fees online with Remita integration
- **Schedule Management** - View class schedules and academic calendar
- **Profile Management** - Update personal information and preferences
- **Notifications** - Receive important updates and announcements

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form with Yup validation
- **Charts**: Recharts & MUI X Charts
- **Styling**: Emotion (CSS-in-JS)
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd student-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3001`

## 🏗️ Project Structure

```
student-portal/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Auth/         # Authentication components
│   │   ├── Layout/       # Layout components
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard page
│   │   ├── courses/      # Course management pages
│   │   ├── grades/       # Grade viewing pages
│   │   ├── payments/     # Payment pages
│   │   └── ...
│   ├── services/         # API services
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── hooks/            # Custom React hooks
│   ├── theme.ts          # MUI theme configuration
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Application entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## 🌐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=University Student Portal
VITE_REMITA_MERCHANT_ID=your-remita-merchant-id
VITE_REMITA_SERVICE_TYPE_ID=your-service-type-id
VITE_REMITA_API_KEY=your-remita-api-key
```

## 🔐 Authentication

The student portal uses JWT-based authentication with the following features:

- Secure login with email and password
- Session management with automatic token refresh
- Protected routes requiring authentication
- Password reset functionality
- Profile management

## 💳 Payment Integration

The portal integrates with Remita payment gateway for:

- Tuition fee payments
- Accommodation fees
- Library and laboratory fees
- Examination fees
- Other institutional charges

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🎨 Theming

The application uses Material-UI's theming system with:

- Custom color palette
- Typography scale
- Component style overrides
- Dark/light mode support (planned)

## 🧪 Testing

The project includes:

- Unit tests with Vitest
- Component testing with React Testing Library
- E2E testing setup (planned)

## 📈 Performance

Optimization features include:

- Code splitting with dynamic imports
- Lazy loading of routes and components
- Image optimization
- Bundle analysis
- Caching strategies

## 🔒 Security

Security measures implemented:

- JWT token management
- Protected API routes
- Input validation and sanitization
- XSS protection
- CSRF protection

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker (Optional)
```bash
docker build -t student-portal .
docker run -p 3001:3001 student-portal
```

## 📚 API Integration

The portal communicates with the backend API for:

- User authentication and authorization
- Academic data (courses, grades, transcripts)
- Payment processing
- Notifications and announcements
- File uploads and downloads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation
- Create an issue on GitHub
- Contact the development team

## 🗺️ Roadmap

### Phase 4.1: Setup & Architecture ✅
- Project initialization
- Routing setup
- Authentication structure

### Phase 4.2: Authentication & Layout (Next)
- Login/logout functionality
- Navigation layout
- Protected routes

### Phase 4.3: Student Dashboard
- Academic overview
- Quick actions
- Notifications

### Phase 4.4: Course Management
- Course enrollment
- Course materials
- Schedule viewing

### Phase 4.5: Grades & Progress
- Grade viewing
- Transcript access
- Progress tracking

### Phase 4.6: Payment Management
- Fee payment with Remita
- Payment history
- Financial statements
