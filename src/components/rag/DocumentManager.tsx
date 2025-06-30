import { useState, useEffect } from 'react';
import { FileText, Trash2, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentUpload } from './DocumentUpload';
import { formatDistanceToNow } from 'date-fns';

interface Document {
  id: string;
  file_name: string;
  content: string;
  metadata: {
    type: string;
    size: number;
    lastModified: number;
  };
  created_at: string;
}

interface DocumentManagerProps {
  instanceId: string;
}

export function DocumentManager({ instanceId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/instances/${instanceId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [instanceId]);

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(
        `/api/instances/${instanceId}/documents?documentId=${documentId}`,
        { method: 'DELETE' }
      );
      
      if (!response.ok) throw new Error('Failed to delete document');
      
      setDocuments(docs => docs.filter(doc => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
      
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Knowledge Base Documents</h2>
        <button
          onClick={fetchDocuments}
          className="p-2 text-gray-500 hover:text-gray-700"
          title="Refresh documents"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <DocumentUpload
        instanceId={instanceId}
        onUploadComplete={fetchDocuments}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-md">
          <AlertCircle className="h-5 w-5 text-gray-400" />
          <p className="text-sm text-gray-600">
            {searchQuery
              ? 'No documents match your search'
              : 'No documents uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className={`
                p-4 rounded-md border transition-colors cursor-pointer
                ${selectedDocument?.id === doc.id
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => setSelectedDocument(doc)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.file_name}</h3>
                    <p className="text-sm text-gray-500">
                      {(doc.metadata.size / 1024).toFixed(1)} KB ·{' '}
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(doc.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {selectedDocument?.id === doc.id && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {doc.content.slice(0, 500)}
                      {doc.content.length > 500 && '...'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-500">
        {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} in total
      </div>
    </div>
  );
} 