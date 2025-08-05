
# RAG Manager Test Document

## Overview
This is a comprehensive test document for the RAG Manager system.
It contains various sections to test different aspects of the pipeline.

## Features
The RAG Manager supports:
- PDF processing with PDF.co API integration
- Document parsing for DOCX, XLSX, CSV, HTML, and text files
- Semantic chunking with configurable overlap
- Vector embeddings using Voyage AI
- Hybrid search combining vector and keyword search

## Technical Implementation
The system uses Convex as the backend platform with the following components:
1. Document storage and management
2. Asynchronous processing pipeline
3. Vector index for similarity search
4. Analytics and monitoring

## Voyage AI Integration
We use Voyage AI's voyage-3 model for text embeddings.
For PDFs with images, we can use voyage-multimodal-3 for enhanced understanding.
The embeddings are 1024-dimensional vectors optimized for semantic search.

## PDF.co Integration
PDF.co handles complex PDF processing including:
- OCR for scanned documents
- Table extraction and formatting
- Image extraction from PDFs
- Multi-page document handling

## Search Capabilities
The search system supports:
- Pure vector search using cosine similarity
- Keyword-based search
- Hybrid search with configurable weights
- Document-specific search filters

## Performance Metrics
- Average processing time: 5-10 seconds per document
- Chunk size: 1000 tokens with 200 token overlap
- Embedding generation: 30 requests per second
- Search latency: <100ms for most queries

## Conclusion
This test verifies end-to-end functionality of the RAG pipeline.
