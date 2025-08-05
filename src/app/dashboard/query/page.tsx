import { CleanQueryInterface } from '@/components/rag/clean-query-interface';

export default function QueryPage() {
  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Query Interface</h1>
          <p className="text-gray-600 mt-2">
            Search through your documents using natural language queries
          </p>
        </div>

        <CleanQueryInterface />
      </div>
    </div>
  );
}