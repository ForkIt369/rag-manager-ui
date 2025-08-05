import { CleanDocumentUpload } from '@/components/rag/clean-document-upload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Info } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
          <p className="text-gray-600 mt-2">
            Add documents to your knowledge base for intelligent querying
          </p>
        </div>

        <CleanDocumentUpload />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                Supported Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• PDF - Portable Document Format</p>
                <p>• DOCX - Microsoft Word Documents</p>
                <p>• EPUB - Electronic Publications</p>
                <p>• XLSX/XLS - Excel Spreadsheets</p>
                <p>• CSV - Comma Separated Values</p>
                <p>• HTML - Web Pages</p>
                <p>• TXT - Plain Text Files</p>
                <p>• JSON - JavaScript Object Notation</p>
                <p>• MD - Markdown Files</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-400" />
                Processing Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Documents are automatically processed and indexed for semantic search capabilities.
                </p>
                <p>
                  Large documents are split into smaller chunks to improve search accuracy and relevance.
                </p>
                <p>
                  Processing time depends on document size and complexity. Most documents are ready within minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}