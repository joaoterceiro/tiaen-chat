import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RAGService } from '@/lib/ai/rag/service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify instance belongs to user
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_instances')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    // Initialize RAG service
    const ragService = new RAGService(supabase);

    // Get documents
    const documents = await ragService.getDocuments(params.id);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify instance belongs to user
    const { data: instance, error: instanceError } = await supabase
      .from('evolution_instances')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', session.user.id)
      .single();

    if (instanceError || !instance) {
      return NextResponse.json(
        { error: 'Instance not found' },
        { status: 404 }
      );
    }

    // Get request body
    const body = await request.json();
    const { fileName, content, metadata } = body;

    if (!fileName || !content) {
      return NextResponse.json(
        { error: 'File name and content are required' },
        { status: 400 }
      );
    }

    // Initialize RAG service
    const ragService = new RAGService(supabase);

    // Process document
    const document = await ragService.processDocument({
      instanceId: params.id,
      fileName,
      content,
      metadata
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error processing document:', error);
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get document ID from query params
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Verify document belongs to instance and user
    const { data: document, error: documentError } = await supabase
      .from('rag_documents')
      .select('id')
      .eq('id', documentId)
      .eq('instance_id', params.id)
      .single();

    if (documentError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Initialize RAG service
    const ragService = new RAGService(supabase);

    // Delete document
    await ragService.deleteDocument(documentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
} 