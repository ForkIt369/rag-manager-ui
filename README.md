# RAG Manager UI

A comprehensive Retrieval Augmented Generation (RAG) system user interface built with Next.js 14, TypeScript, and Tailwind CSS. This modern, responsive web application provides a complete interface for managing documents, performing vector searches, and analyzing system performance.

## 🚀 Features

### 📁 Document Management
- **Multi-format Support**: Upload and process PDF, DOCX, EPUB, Excel, CSV, HTML, TXT, JSON, and Markdown files
- **Drag & Drop Interface**: Intuitive file upload with progress tracking
- **Real-time Processing**: Live status updates during document ingestion
- **Batch Operations**: Upload multiple documents simultaneously

### 🗂️ Knowledge Base Browser
- **Tree View Navigation**: Hierarchical document organization
- **Advanced Search**: Full-text search across all documents
- **Document Details**: Comprehensive metadata and statistics
- **Filter & Sort**: Multiple organization and filtering options

### 🔍 Query Interface
- **Natural Language Queries**: Ask questions in plain English
- **Search History**: Track and revisit previous queries
- **Result Scoring**: Relevance scores for all search results
- **Quick Actions**: Pre-built query templates
- **Syntax Highlighting**: Enhanced query visualization

### 📊 Analytics Dashboard
- **Usage Metrics**: Document count, query statistics, storage usage
- **Performance Analytics**: Query response times and success rates
- **Interactive Charts**: Time series data and trend visualization
- **Top Queries & Documents**: Most frequently accessed content

### ⚙️ Settings Management
- **API Key Configuration**: Secure storage for OpenAI, Anthropic, and Voyage AI keys
- **Model Selection**: Choose embedding and chat models
- **Chunking Parameters**: Customize document processing settings
- **Search Configuration**: Default limits and thresholds
- **Theme Support**: Light, dark, and system themes

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Convex (serverless backend)
- **Charts**: Recharts
- **Icons**: Lucide React
- **File Upload**: React Dropzone

## 🏗️ Project Structure

```
rag-manager-ui/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main application page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   └── rag/                # RAG-specific components
│   │       ├── document-upload.tsx
│   │       ├── knowledge-base-browser.tsx
│   │       ├── query-interface.tsx
│   │       ├── analytics-dashboard.tsx
│   │       ├── settings-page.tsx
│   │       └── layout.tsx
│   ├── lib/
│   │   ├── utils.ts            # Utility functions
│   │   └── convex.ts           # Convex API client
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript type definitions
├── public/                     # Static assets
├── .env.example               # Environment variables template
├── .env.local                 # Local environment variables
├── vercel.json               # Vercel deployment config
└── package.json              # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Convex account and deployment
- API keys for AI services (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rag-manager-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Convex deployment URL:
   ```env
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run preview` - Build and preview production locally

## 🔧 Configuration

### Connecting to Convex Backend

This UI is designed to work with the existing `convex-rag-system` backend. Ensure your Convex backend has the following functions:

- `documents:upload` - Document upload handler
- `documents:list` - List documents with filtering
- `documents:get` - Get single document
- `documents:delete` - Delete document
- `vectorSearch:search` - Vector similarity search
- `vectorSearchV2:search` - Enhanced vector search
- `documentSections:list` - Get document sections
- `files:list` - List uploaded files

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Your Convex deployment URL | Yes |
| `NODE_ENV` | Environment (development/production) | No |

### API Keys Configuration

API keys are configured through the Settings page in the application. The following services are supported:

- **OpenAI**: For chat models and embeddings
- **Anthropic**: For Claude models
- **Voyage AI**: For specialized embeddings

## 🎨 Customization

### Theme Customization

The application uses CSS custom properties for theming. Customize colors in `src/app/globals.css`:

```css
:root {
  --primary: 199 89% 48%;        /* Blue primary color */
  --secondary: 0 0% 96.1%;       /* Light gray secondary */
  /* ... other color variables */
}
```

### Component Styling

All components use Tailwind CSS with shadcn/ui for consistent styling. Modify component styles by editing the respective files in `src/components/`.

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first design approach
- Collapsible sidebar navigation
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

## 🔒 Security Considerations

- API keys are stored in browser localStorage (consider server-side storage for production)
- All API communications use HTTPS
- File uploads are validated for type and size
- No sensitive data is logged to console in production

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Add environment variables**:
   - `NEXT_PUBLIC_CONVEX_URL`: Your Convex deployment URL
3. **Deploy**: Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

### Environment Variables for Production

Set the following environment variables in your hosting platform:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-production-convex.convex.cloud
NODE_ENV=production
```

## 📊 Performance

The application is optimized for performance with:
- Next.js App Router with Server Components
- Dynamic imports for code splitting
- Optimized bundle size
- Efficient re-rendering with React hooks
- Virtualized scrolling for large lists

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the excellent component library
- [Convex](https://convex.dev/) for the serverless backend platform
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Radix UI](https://radix-ui.com/) for accessible component primitives

## 📞 Support

For questions and support:
- Create an issue in the repository
- Check the existing documentation
- Review the Convex backend integration guide

---

Built with ❤️ using modern web technologies for an exceptional RAG system experience.
